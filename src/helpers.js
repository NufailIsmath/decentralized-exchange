export const ETHER_ADDRESS = "0x0000000000000000000000000000000000000000";

export const RED = 'danger';
export const GREEN = 'success'

export const DECIMALS = (10 ** 18);

export const ether = (wei) => {
    if (wei) {
        return (wei / DECIMALS); //18 Decimal place
    }
}

// Tokens and ether have the same decimal resolution
export const tokens = ether;