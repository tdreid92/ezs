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
