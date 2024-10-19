import type { Config } from '@jest/types';

export default async (): Promise<Config.InitialOptions> => {
    return {
        verbose: true,
        modulePathIgnorePatterns: ['<rootDir>/dist/'],
        preset: 'ts-jest',
        testEnvironment: 'node',
        coverageReporters: ['json-summary', 'lcov', 'text', 'text-summary'],
        moduleNameMapper: {
            // Se for utilizar módulos linkados, comentar a linha abaixo:
            //'@designliquido/delegua/(.*)': '<rootDir>/node_modules/@designliquido/delegua/$1'
            // E descomentar a linha abaixo:
            '@designliquido/delegua/(.*)': '<rootDir>/node_modules/@designliquido/delegua/fontes/$1'
        },
    };
};
