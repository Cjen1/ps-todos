export type OrderedItem<Id extends string> = {
    id: Id;
    order: number;
};

export function ordered_items<Id extends string>(items: OrderedItem<Id>[]) {
    return [...items].sort((a, b) => a.order - b.order);
}

export function random_order_between(prev_order: number | null, next_order: number | null) {
    let low = 0;
    let high = 1;
    if (prev_order !== null && next_order !== null) {
        low = Math.min(prev_order, next_order);
        high = Math.max(prev_order, next_order);
    } else if (prev_order !== null || next_order !== null) {
        const v = (prev_order ?? next_order) as number;
        low = Math.min(v, 0);
        high = Math.max(v, 1);
    }
    return low + Math.random() * (high - low);
}

export function moved_order<Id extends string>(items: OrderedItem<Id>[], active_id: Id, over_id: Id) {
    if (active_id === over_id) {
        return null;
    }

    const sorted_items = ordered_items(items);
    const active_item = sorted_items.find((item) => item.id === active_id);
    const over_idx = sorted_items.findIndex((item) => item.id === over_id);

    if (!active_item || over_idx === -1) {
        return null;
    }

    if (active_item.order < sorted_items[over_idx].order) {
        const prev_order = sorted_items[over_idx]?.order;
        const next_order = sorted_items[over_idx + 1]?.order ?? 1;
        return random_order_between(prev_order, next_order);
    }

    if (active_item.order > sorted_items[over_idx].order) {
        const prev_order = sorted_items[over_idx - 1]?.order ?? 0;
        const next_order = sorted_items[over_idx]?.order;
        return random_order_between(prev_order, next_order);
    }

    return null;
}
