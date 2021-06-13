import { easeLinear } from 'd3-ease';
import { select } from 'd3-selection';
import 'd3-transition';
import { appendIfNotExists } from './helpers';
import './index.css';

type RotaryValue<T> = {
    label: string;
    value: T
}

type RotaryOptions = {
    width: number;
}

function angle(point1: [number, number], point2: [number, number]) {
    const x = point2[0] - point1[0];
    const y = point1[1] - point2[1];
    const standardAngle = Math.atan2(y, x);
    return standardAngle < 0 ? standardAngle + Math.PI * 2 : standardAngle;
}

export default class RotaryInput<T> {
    svg: SVGElement;
    values: RotaryValue<T | string>[];
    options: RotaryOptions;
    callback: (out: T[]) => void;
    backCallback: () => void;

    mouseDownOrigin: [number, number] | null = null;
    startAngle = 0;
    currentAngle = 0;
    buffer: T[] = [];
    timer: number | null = null;

    constructor(el: Element, values: RotaryValue<T>[], options: RotaryOptions) {
        const node = select(el)
            .append('svg')
            .classed('rotary-input', true)
            .attr('width', options.width)
            .attr('height', options.width)
            .node();

        if (!node) {
            throw new Error('Couldn\'t mount rotary input on root node.')
        }
        this.svg = node;
        this.values = [...values, { label: '<', value: '__back' }];
        this.options = options;
        this.callback = () => {}
        this.backCallback = () => {}

        this.draw();
        this.setupTouch();
    }

    get center() {
        return this.options.width / 2;
    }

    get inc() {
        return Math.PI * 2 / (this.values.length + 2);
    }

    flushBuffer() {
        this.callback(this.buffer);
        this.buffer = [];
    }

    onComplete(callback: (out: T[]) => void) {
        this.callback = callback;
    }

    onBack(callback: () => void) {
        this.backCallback = callback;
    }

    draw() {
        appendIfNotExists(select(this.svg), 'circle', 'inside')
            .attr('cx', this.center)
            .attr('cy', this.center)
            .attr('r', this.center / 3)
            .attr('fill', 'none')
            .attr('stroke', 'grey');

        const smallR = 15;
        const bigR = this.options.width / 6;
        const r = smallR + bigR + 5;

        appendIfNotExists(select(this.svg), 'g', 'rotary')
            .selectAll<SVGCircleElement, RotaryValue<T | string>>('circle.hole')
            .data(this.values, d => d.label)
            .join('circle')
            .classed('hole', true)
            .attr('cx', (d, i) => this.center + r * Math.cos((this.inc * (i + 1)) + (this.inc / 2)))
            .attr('cy', (d, i) => this.center - r * Math.sin((this.inc * (i + 1)) + (this.inc / 2)))
            .attr('r', smallR)
            .attr('fill', 'white')
            .attr('stroke', 'black');

        appendIfNotExists(select(this.svg), 'g', 'labels')
            .selectAll<SVGCircleElement, RotaryValue<T | string>>('text.label')
            .data(this.values, d => d.label)
            .join('text')
            .classed('label', true)
            .attr('x', (d, i) => this.center + (r + 2 * smallR) * Math.cos((this.inc * (i + 1)) + (this.inc / 2)))
            .attr('y', (d, i) => this.center - (r + 2 * smallR) * Math.sin((this.inc * (i + 1)) + (this.inc / 2)))
            .text(d => d.label);
    }

    setRotate(angle: number, transition?: boolean) {
        const rotary = select(this.svg).select('g.rotary');
        if (transition) {
            const currentAngle = Number(rotary.style('transform').match(/rotate\(([-\d\.]+)rad\)/)?.[1] || 0);
            rotary.transition()
                .styleTween('transform', () => {
                    return (t: number) => `rotate(${t * angle + (1 - t) * currentAngle}rad)`;
                })
        } else {
            rotary.style('transform', `rotate(${angle}rad)`);
        }
    }

    setupTouch() {
        select(this.svg)
            .on('mousedown', e => {
                const bbox = this.svg.getBoundingClientRect();
                const x = e.x - bbox.x;
                const y = e.y - bbox.y;
                this.mouseDownOrigin = [bbox.x, bbox.y];
                this.startAngle = angle([this.center, this.center], [x, y]);
            })
            .on('mousemove', e => {
                if (this.mouseDownOrigin) {
                    if (this.timer) clearTimeout(this.timer);

                    const x = e.x - this.mouseDownOrigin[0];
                    const y = e.y - this.mouseDownOrigin[1];
                    const newAngle = angle([this.center, this.center], [x, y]);
                    if (newAngle < this.startAngle) {
                        this.currentAngle = newAngle;
                        this.setRotate(this.startAngle - this.currentAngle);
                    }
                }
            })
            .on('mouseup', e => {
                if (this.mouseDownOrigin) {
                    const x = e.x - this.mouseDownOrigin[0];
                    const y = e.y - this.mouseDownOrigin[1];
                    const newAngle = angle([this.center, this.center], [x, y]);
                    const constrainedAngle = newAngle < this.startAngle ? newAngle : 0;
                    const selectedInc = Math.floor(Math.max(0, ((this.startAngle - constrainedAngle) / this.inc) - 1));
                    const selectedValue = this.values[selectedInc].value;
                    if (selectedValue === '__back') {
                        this.buffer = [];
                        this.backCallback();
                    } else {
                        this.buffer.push(selectedValue as T);
                        this.timer = setTimeout(() => this.flushBuffer(), 1500);
                    }
                }
                
                this.startAngle = 0;
                this.currentAngle = 0;
                this.setRotate(0, true);
                this.mouseDownOrigin = null;
            });
    }
}
