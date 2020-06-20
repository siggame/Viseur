const REFRESH_DURATION = 20000;

// source:
// https://www.bypeople.com/svg-low-poly-background-css-js-snippet/

/** A point used for Polygon node movement calculations. */
interface PolyPoint {
    /** The x position. */
    x: number;

    /** The y position. */
    y: number;

    /** The origin x position. */
    originX: number;

    /** The y position. */
    originY: number;
}

/** A node used for polygons. */
type PolyNode = Node &
    Element & {
        /**
         * Function some node's have in some browsers to start animations on
         * SVG.
         */
        beginElement?(): void;
    };

/** A Polygon element. */
type Polygon = Element & {
    /** First point. */
    point1: number;
    /** Second point. */
    point2: number;
    /** Third point. */
    point3: number;
};

/**
 * Injects an animated pretty low poly SVG into a DOM element and animates it.
 */
export class PrettyPolygons {
    /** Timer that refreshed on each tick. */
    private interval: number; // as we are in browser, not node

    /** The SVG we are manipulating. */
    private readonly svg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg",
    );

    /** Size for a poly. */
    private readonly unitSize: number;

    /** Number of points along x. */
    private readonly numPointsX: number;

    /** Number of points along y. */
    private readonly numPointsY: number;

    /** Width of a poly. */
    private readonly unitWidth: number;

    /** Height of a poly. */
    private readonly unitHeight: number;

    /** The points we will manipulate. */
    private readonly points: PolyPoint[] = [];

    /**
     * Creates the pretty polygons inside some parent element.
     *
     * @param $parent - The Jquery wrapped parent element.
     */
    constructor($parent: JQuery) {
        const width = Number($parent.width()) || 1000;
        const height = Number($parent.height()) || 1000;

        this.svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
        this.svg.setAttribute("preserveAspectRatio", "none");
        this.svg.setAttribute("style", "width: 100%; height: 100%;");

        $parent.append(this.svg);

        this.unitSize = (height + width) / 16;
        this.numPointsX = Math.ceil(width / this.unitSize) + 1;
        this.numPointsY = Math.ceil(height / this.unitSize) + 1;
        this.unitWidth = Math.ceil(width / (this.numPointsX - 1));
        this.unitHeight = Math.ceil(height / (this.numPointsY - 1));

        for (let y = 0; y < this.numPointsY; y++) {
            for (let x = 0; x < this.numPointsX; x++) {
                this.points.push({
                    x: this.unitWidth * x,
                    y: this.unitHeight * y,
                    originX: this.unitWidth * x,
                    originY: this.unitHeight * y,
                });
            }
        }

        this.randomize();

        for (let i = 0; i < this.points.length; i++) {
            const point = this.points[i];

            if (
                point.originX !== this.unitWidth * (this.numPointsX - 1) &&
                point.originY !== this.unitHeight * (this.numPointsY - 1)
            ) {
                const topLeftX = point.x;
                const topLeftY = point.y;
                const topRightX = this.points[i + 1].x;
                const topRightY = this.points[i + 1].y;
                const bottomLeftX = this.points[i + this.numPointsX].x;
                const bottomLeftY = this.points[i + this.numPointsX].y;
                const bottomRightX = this.points[i + this.numPointsX + 1].x;
                const bottomRightY = this.points[i + this.numPointsX + 1].y;

                const rand = Math.floor(Math.random() * 2);

                for (let n = 0; n < 2; n++) {
                    const polygon = document.createElementNS(
                        this.svg.namespaceURI,
                        "polygon",
                    ) as Polygon;

                    if (rand === 0) {
                        if (n === 0) {
                            polygon.point1 = i;
                            polygon.point2 = i + this.numPointsX;
                            polygon.point3 = i + this.numPointsX + 1;
                            polygon.setAttribute(
                                "points",
                                `${topLeftX},${topLeftY} ${bottomLeftX},${bottomLeftY} ${bottomRightX},${bottomRightY}`,
                            );
                        } else if (n === 1) {
                            polygon.point1 = i;
                            polygon.point2 = i + 1;
                            polygon.point3 = i + this.numPointsX + 1;
                            polygon.setAttribute(
                                "points",
                                `${topLeftX},${topLeftY} ${topRightX},${topRightY} ${bottomRightX},${bottomRightY}`,
                            );
                        }
                    } else if (rand === 1) {
                        if (n === 0) {
                            polygon.point1 = i;
                            polygon.point2 = i + this.numPointsX;
                            polygon.point3 = i + 1;
                            polygon.setAttribute(
                                "points",
                                `${topLeftX},${topLeftY} ${bottomLeftX},${bottomLeftY} ${topRightX},${topRightY}`,
                            );
                        } else if (n === 1) {
                            polygon.point1 = i + this.numPointsX;
                            polygon.point2 = i + 1;
                            polygon.point3 = i + this.numPointsX + 1;
                            polygon.setAttribute(
                                "points",
                                `${bottomLeftX},${bottomLeftY} ${topRightX},` +
                                    `${topRightY} ${bottomRightX},${bottomRightY}`,
                            );
                        }
                    }

                    polygon.setAttribute(
                        "fill",
                        `rgba(0,0,0,${Math.random() / 3})`,
                    );

                    const animate = document.createElementNS(
                        "http://www.w3.org/2000/svg",
                        "animate",
                    );

                    animate.setAttribute("fill", "freeze");
                    animate.setAttribute("attributeName", "points");
                    animate.setAttribute("dur", `${REFRESH_DURATION}ms`);
                    animate.setAttribute("calcMode", "linear");
                    polygon.appendChild(animate);
                    this.svg.appendChild(polygon);
                }
            }
        }

        this.refresh();

        this.interval = 0; // window.setInterval(() => this.refresh(), REFRESH_DURATION);
    }

    /**
     * Stops the animation (cannot be resumed).
     */
    public stop(): void {
        clearInterval(this.interval);
        this.interval = 0;

        const childNodes = this.svg.childNodes;
        // type does not have an iterator symbol set
        for (let i = 0; i < childNodes.length; i++) {
            const polygon = childNodes[i];
            const animate = polygon.childNodes[0] as PolyNode;

            animate.setAttribute("dur", "0");
        }
    }

    /**
     * Randomizes the points for the polys to move to.
     */
    private randomize(): void {
        for (const point of this.points) {
            if (
                point.originX !== 0 &&
                point.originX !== this.unitWidth * (this.numPointsX - 1)
            ) {
                point.x =
                    point.originX +
                    Math.random() * this.unitWidth -
                    this.unitWidth / 20;
            }

            if (
                point.originY !== 0 &&
                point.originY !== this.unitHeight * (this.numPointsY - 1)
            ) {
                point.y =
                    point.originY +
                    Math.random() * this.unitHeight -
                    this.unitHeight / 20;
            }
        }
    }

    /**
     * Refreshes the attributes of the polys so they animate to their new
     * points.
     */
    private refresh(): void {
        if (!this.interval) {
            this.stop();

            return;
        }

        this.randomize();

        const childNodes = this.svg.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            const polygon = childNodes[i] as Polygon;
            const animate = polygon.childNodes[0] as PolyNode;

            if (!animate.beginElement) {
                // we are on IE or Edge, or some browser that does not support SVG animation. Abort!
                this.stop();

                return;
            }

            if (animate.getAttribute("to")) {
                animate.setAttribute("from", animate.getAttribute("to") || "");
            }

            animate.setAttribute(
                "to",
                `${this.points[polygon.point1].x},${
                    this.points[polygon.point1].y
                } ${this.points[polygon.point2].x}` +
                    `,${this.points[polygon.point2].y} ${
                        this.points[polygon.point3].x
                    },${this.points[polygon.point3].y}`,
            );
            animate.beginElement();
        }
    }
}
