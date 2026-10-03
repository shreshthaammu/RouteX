/**
 * Standard Binary Min-Heap Priority Queue for DAA pathfinding
 * Supports Dijkstra and A* with O(log N) insert and extract-min
 */

export interface PQItem<T> {
  element: T;
  priority: number;
}

export class PriorityQueue<T> {
  private heap: PQItem<T>[] = [];

  constructor() {}

  public size(): number {
    return this.heap.length;
  }

  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  public peek(): PQItem<T> | undefined {
    return this.heap[0];
  }

  public enqueue(element: T, priority: number): void {
    const item: PQItem<T> = { element, priority };
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  public dequeue(): PQItem<T> | undefined {
    if (this.isEmpty()) return undefined;
    const top = this.heap[0];
    const bottom = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this.bubbleDown(0);
    }
    return top;
  }

  public toArray(): PQItem<T>[] {
    return [...this.heap];
  }

  private bubbleUp(index: number): void {
    let currentIdx = index;
    const item = this.heap[currentIdx];

    while (currentIdx > 0) {
      const parentIdx = Math.floor((currentIdx - 1) / 2);
      const parent = this.heap[parentIdx];

      if (item.priority >= parent.priority) {
        break;
      }

      this.heap[currentIdx] = parent;
      currentIdx = parentIdx;
    }
    this.heap[currentIdx] = item;
  }

  private bubbleDown(index: number): void {
    let currentIdx = index;
    const length = this.heap.length;
    const item = this.heap[currentIdx];

    while (true) {
      const leftChildIdx = 2 * currentIdx + 1;
      const rightChildIdx = 2 * currentIdx + 2;
      let swapIdx: number | null = null;

      if (leftChildIdx < length) {
        if (this.heap[leftChildIdx].priority < item.priority) {
          swapIdx = leftChildIdx;
        }
      }

      if (rightChildIdx < length) {
        const compareIdx = swapIdx === null ? currentIdx : leftChildIdx;
        if (this.heap[rightChildIdx].priority < this.heap[compareIdx].priority) {
          swapIdx = rightChildIdx;
        }
      }

      if (swapIdx === null) break;

      this.heap[currentIdx] = this.heap[swapIdx];
      currentIdx = swapIdx;
    }
    this.heap[currentIdx] = item;
  }
}
