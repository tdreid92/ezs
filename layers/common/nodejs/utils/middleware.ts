export class Middleware {
  middlewares: any[];

  constructor(middlewares: any[] = []) {
    this.middlewares = middlewares;
  }

  next(current: number, ...args: any[]): any {
    const middleware = this.middlewares[current];
    const next = this.next.bind(this, ++current);

    if (typeof middleware !== 'function') return middleware;

    return middleware(...args, next);
  }

  resolve(...args: any[]): any {
    return this.next(0, ...args);
  }

  use(middleware: any): this {
    const middlewares = this.middlewares.slice();
    middlewares.push(middleware);

    this.middlewares = middlewares;
    return this;
  }
}
