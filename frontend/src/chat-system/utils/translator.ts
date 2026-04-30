
export  const   translateToBigInt = (id: string) : bigint | null => {
    try {
        return BigInt(id);
    } catch (error: unknown) {
        console.error("Invalid BigInt string");
        return null;
    }
}