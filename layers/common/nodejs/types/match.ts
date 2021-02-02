export type Predicate<T> = (x: T) => boolean;
export type Transformation<T> = (x: T) => any;
export type MatchContext<T> = {
  on: (predicate?: Predicate<T>, fn?: Transformation<T>) => MatchContext<T | any>;
  otherwise: (fn: Transformation<T>) => any;
};

export function matched<T>(value: T): MatchContext<T> {
  return {
    on: () => matched(value),
    otherwise: () => value
  };
}

/**
 *
 * @param value
 */
export function match<T>(value: T): MatchContext<T> {
  return {
    on: (predicate: Predicate<any> | undefined, fn: Transformation<any> | undefined) =>
      !predicate || predicate(value) ? matched(fn ? fn(value) : undefined) : match(value),
    otherwise: (fn) => fn(value)
  };
}

/**
 * Omit type T from type V
 *
 * Author: stackoverflow.com/users/985454/qwerty
 */
export type Omit<T, V extends keyof T> = Pick<T, Exclude<keyof T, V>>;

/**
 * Merge type T and override values to type T with type V
 *
 * Author: stackoverflow.com/users/985454/qwerty
 */
export type Merge<T, V> = Omit<T, Extract<keyof T, keyof V>> & V;
