const decrypt = (encryptedText) => {
    // Get the length of the encrypted text
    let len = encryptedText.length;
    
    // Calculate the remainder when length is divided by 10
    let C3 = len - Math.floor(len / 10) * 10;
    
    // Determine D3 based on the value of C3
    let D3 = (C3 <= 5) ? 5 - C3 : 10 - C3;
    
    // Set E3 to 0 if C3 is 0, otherwise set it to D3
    let E3 = (C3 === 0) ? 0 : D3;
    
    // Calculate F3 as the sum of len and E3, divided by 5
    let F3 = (len + E3) / 5;
    
    // Calculate G3, H3, I3, J3, and K3 based on the value of E3
    let G3 = (E3 > 0) ? F3 - 1 : F3;
    let H3 = (E3 > 1) ? F3 - 1 : F3;
    let I3 = (E3 > 2) ? F3 - 1 : F3;
    let J3 = (E3 > 3) ? F3 - 1 : F3;
    let K3 = (E3 > 4) ? F3 - 1 : F3;
    
    // Initialize L3 to 1
    let L3 = 1;
    
    // Extract substrings from the encrypted text based on calculated indices and lengths
    let M3 = encryptedText.substr(L3 - 1, G3);
    let N3 = L3 + G3;
    let O3 = encryptedText.substr(N3 - 1, H3);
    let P3 = N3 + H3;
    let Q3 = encryptedText.substr(P3 - 1, I3);
    let R3 = P3 + I3;
    let S3 = encryptedText.substr(R3 - 1, J3);
    let T3 = R3 + J3;
    let U3 = encryptedText.substr(T3 - 1, K3);
    
    // Concatenate the substrings to form W3
    let W3 = U3 + S3 + Q3 + O3 + M3;

    // Helper function to split a string into an array of characters up to a specified length
    function splitIntoArray(str, length) {
        let arr = [];
        for (let i = 0; i < length; i++) {
            arr.push(str.charAt(i) || "");
        }
        return arr;
    }

    // Split the substrings into arrays of length 28
    let AC3 = splitIntoArray(U3, 28);
    let BE3 = splitIntoArray(S3, 28);
    let CG3 = splitIntoArray(Q3, 28);
    let DI3 = splitIntoArray(O3, 28);
    let EK3 = splitIntoArray(M3, 28);

    // Initialize an empty array to store the final result
    let finalResultArray = [];
    
    // Concatenate corresponding elements from the arrays and push to finalResultArray
    for (let i = 0; i < 28; i++) {
        finalResultArray.push(AC3[i] + BE3[i] + CG3[i] + DI3[i] + EK3[i]);
    }
    
    // Join the elements of finalResultArray into a single string and return it
    return finalResultArray.join("");
};

const decryptFile = (fileContent) => {
    // Split the file content into lines
    const lines = fileContent.split('\n');
    
    // Decrypt each line and categorize the decrypted data
    const decryptedLines = lines.map(line => {
        const decryptedLine = decrypt(line);
        const columns = decryptedLine.split('||');
        const factura = columns[1]; // Assuming FACTURA is the second column
        let tipo = '';
        
        // Determine the type based on the prefix of the factura
        if (factura.startsWith('N')) {
            tipo = 'NUEVA'; //NEW
        } else if (factura.startsWith('U')) {
            tipo = 'USADA'; //USED
        } else if (factura.startsWith('C')) {
            tipo = 'CARROCERA'; //
        }
        
        // Update the last column with the determined type
        columns[7] = tipo; // Assuming TIPO is the last column
        
        // Only include the first 8 columns in the final result
        return columns.slice(0, 8).join('||');
    });
    
    // Join the decrypted lines into a single string and return it
    return decryptedLines.join('\n');
}

export default decryptFile;