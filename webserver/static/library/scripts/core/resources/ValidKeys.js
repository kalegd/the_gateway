let validKeysString = " 1234567890`~!@#$%^&*()-_=+[]{}\\|;:'\",.<>/?qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM"

let validKeys = new Set();

for(let character of validKeysString) {
    validKeys.add(character);
}

export default validKeys;
