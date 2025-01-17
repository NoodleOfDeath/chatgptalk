export type SerializableKey = number | string;

export type SerializablePrimative = boolean | number | string;

export type SerializableDict<K extends SerializableKey = SerializableKey, V extends SerializablePrimative = SerializablePrimative> = Record<K, V>;

export type Serializable = SerializableDict | SerializablePrimative;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
