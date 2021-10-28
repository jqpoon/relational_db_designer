module.exports = {  
    "roots": [    
        "<rootDir>/src"  
    ],  
    "testMatch": [    
        "**/__tests__/**/*.+(ts|tsx|js)",    
        "**/?(*.)+(spec|test).+(ts|tsx|js)"  
    ],  
    "transform": {    
        "^.+\.tsx?$": "<rootDir>/node_modules/ts-jest/preprocessor.js"  
    },
    "globals": {
        "ts-jest": {
          "tsConfig": "tsconfig.json"
        }
    },
}