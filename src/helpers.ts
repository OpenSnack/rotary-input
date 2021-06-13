import { BaseType, Selection } from 'd3-selection';

export function appendIfNotExists<T extends BaseType>(
    selection: Selection<any, unknown, any, unknown>,
    tag: string,
    cls: string
): Selection<T, unknown, any, unknown> {
    let child = selection
        .select<T>(`${tag}.${cls}`);
    if (child.empty()) {
        child = selection
            .append<T>(tag)
            .classed(cls, true);
    }

    return child;
}
