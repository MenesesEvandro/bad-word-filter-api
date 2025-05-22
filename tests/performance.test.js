const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const app = require('../src/app');

app.use(bodyParser.json());

describe('API Performance Tests', () => {
    // Funções auxiliares para medição
    const measureMemory = () => {
        const used = process.memoryUsage();
        return {
            heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
            heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
            rss: Math.round(used.rss / 1024 / 1024 * 100) / 100
        };
    };

    const measurePerformance = async (fn) => {
        const startMemory = measureMemory();
        const startTime = Date.now();
        const result = await fn();
        const endTime = Date.now();
        const endMemory = measureMemory();
        
        return {
            responseTime: endTime - startTime,
            memoryDelta: {
                heapUsed: endMemory.heapUsed - startMemory.heapUsed,
                heapTotal: endMemory.heapTotal - startMemory.heapTotal,
                rss: endMemory.rss - startMemory.rss
            },
            result
        };
    };

    // Test response time for single text
    test('Single text processing should respond within 100ms', async () => {
        const { responseTime, memoryDelta, result } = await measurePerformance(async () =>
            request(app)
                .post('/filter')
                .send({
                    text: 'this is a test text with some bad words like bullshit and damn',
                    lang: 'en'
                })
        );

        expect(result.status).toBe(200);
        expect(responseTime).toBeLessThan(100);
        expect(Math.abs(memoryDelta.heapUsed)).toBeLessThan(10); // Menos de 10MB de variação
    });

    // Test response time for array of texts
    test('Array of 100 texts should process within 1000ms', async () => {
        const texts = Array.from({ length: 100 }, () => 
            'this is a test text with some bad words like bullshit and damn'
        );

        const startTime = Date.now();
        const res = await request(app)
            .post('/filter')
            .send({
                text: texts,
                lang: 'en'
            });
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        expect(res.status).toBe(200);
        expect(responseTime).toBeLessThan(1000); // Should process in less than 1 second
        expect(res.body.results).toHaveLength(100);
    });

    // Test regex performance with complex patterns
    test('Should handle complex regex patterns efficiently', async () => {
        const complexText = Array(100).fill()
            .map((_, i) => `test${i} with (complex) [patterns] {and} <symbols> ~!@#$%^&*`)
            .join(' ');

        const { responseTime, result } = await measurePerformance(async () =>
            request(app)
                .post('/filter')
                .send({
                    text: complexText,
                    extras: ['test[0-9]+', '\\(.*\\)', '\\[.*\\]'],
                    lang: 'en'
                })
        );

        expect(result.status).toBe(200);
        expect(responseTime).toBeLessThan(200);
    });

    // Test multi-language performance
    test('Should maintain performance across different languages', async () => {
        const languages = ['en', 'pt-br', 'es', 'fr', 'de', 'it'];
        const results = [];

        for (const lang of languages) {
            const { responseTime, result } = await measurePerformance(async () =>
                request(app)
                    .post('/filter')
                    .send({
                        text: 'test text with badwords',
                        lang,
                        include_stats: true
                    })
            );

            results.push({ lang, responseTime, status: result.status });
            expect(result.status).toBe(200);
        }

        // Verificar variação de performance entre idiomas
        const times = results.map(r => r.responseTime);
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const maxVariation = Math.max(...times) - Math.min(...times);
        
        expect(avgTime).toBeLessThan(100);
        expect(maxVariation).toBeLessThan(50); // Variação máxima de 50ms entre idiomas
    });

    // Test concurrent requests
    test('Should handle 50 concurrent requests within 2000ms', async () => {
        const numberOfRequests = 50;
        const startTime = Date.now();

        const requests = Array.from({ length: numberOfRequests }, () =>
            request(app)
                .post('/filter')
                .send({
                    text: 'this is a test text with some bad words like bullshit and damn',
                    lang: 'en'
                })
        );

        const results = await Promise.all(requests);
        const endTime = Date.now();
        const totalTime = endTime - startTime;

        expect(totalTime).toBeLessThan(2000); // All requests should complete within 2 seconds
        results.forEach(res => {
            expect(res.status).toBe(200);
            expect(res.body.results.isFiltered).toBe(true);
            expect(res.body.results.words_found.length).toBeGreaterThan(0);
        });
    });

    // Test memory usage with large array
    test('Should handle large array of 1000 texts without memory issues', async () => {
        const texts = Array.from({ length: 1000 }, (_, i) => 
            `text number ${i} with some bad words like bullshit and damn`
        );

        const res = await request(app)
            .post('/filter')
            .send({
                text: texts,
                lang: 'en'
            });

        expect(res.status).toBe(200);
        expect(res.body.results).toHaveLength(1000);
    });

    // Test with long text
    test('Should process very long text efficiently', async () => {
        // Adjust the length to be less than 10,000 characters
        const LONG_TEXT_LENGTH = 9500; // secure the text is less than 10.000 characters
        const longText = 'this is bullshit '.repeat(Math.floor(LONG_TEXT_LENGTH / 17));

        const startTime = Date.now();
        const res = await request(app)
            .post('/filter')
            .send({
                text: longText,
                lang: 'en'
            });
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        expect(res.status).toBe(200);
        expect(responseTime).toBeLessThan(500); // Should process in less than 500ms
    });

    // Test with many extra words
    test('Should handle maximum number of extra words efficiently', async () => {
        const extras = Array.from({ length: 10 }, (_, i) => `extraword${i}`);
        const text = 'text with ' + extras.join(' ');

        const startTime = Date.now();
        const res = await request(app)
            .post('/filter')
            .send({
                text,
                extras,
                lang: 'en'
            });
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        expect(res.status).toBe(200);
        expect(responseTime).toBeLessThan(100);
        expect(res.body.extra_words).toHaveLength(10);
    });

    // Test sustained load over time
    test('Should maintain performance under sustained load', async () => {
        const numberOfBatches = 5;
        const requestsPerBatch = 20;
        const responseTimesMs = [];

        for (let batch = 0; batch < numberOfBatches; batch++) {
            const startTime = Date.now();
            const requests = Array.from({ length: requestsPerBatch }, () =>
                request(app)
                    .post('/filter')
                    .send({
                        text: 'this is a test text with some bad words like bullshit and damn',
                        lang: 'en'
                    })
            );

            const results = await Promise.all(requests);
            const endTime = Date.now();
            responseTimesMs.push(endTime - startTime);

            // Verify all requests were successful
            results.forEach(res => expect(res.status).toBe(200));

            // Short pause between batches
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Calculate average response time
        const averageResponseTime = responseTimesMs.reduce((a, b) => a + b) / responseTimesMs.length;
        expect(averageResponseTime).toBeLessThan(1000); // Average should be under 1 second
    });

    // Test rapid consecutive requests
    test('Should handle rapid consecutive requests', async () => {
        const numberOfRequests = 20;
        const delays = [0, 10, 20, 50]; // Milliseconds between requests

        for (const delay of delays) {
            const startTime = Date.now();
            
            for (let i = 0; i < numberOfRequests; i++) {
                const res = await request(app)
                    .post('/filter')
                    .send({
                        text: 'test text',
                        lang: 'en'
                    });
                
                expect(res.status).toBe(200);
                
                if (delay > 0) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }

            const totalTime = Date.now() - startTime;
            const expectedMaxTime = (numberOfRequests * delay) + 1000; // 1 second buffer

            expect(totalTime).toBeLessThan(expectedMaxTime);
        }
    });

    // Test cache efficiency
    test('Cache should improve performance significantly', async () => {
        const payload = {
            text: 'test with badwords for cache',
            lang: 'en'
        };

        // Primeira requisição (sem cache)
        const uncached = await measurePerformance(async () =>
            request(app)
                .post('/filter')
                .send(payload)
        );

        // Segunda requisição (com cache)
        const cached = await measurePerformance(async () =>
            request(app)
                .post('/filter')
                .send(payload)
        );

        expect(cached.responseTime).toBeLessThanOrEqual(uncached.responseTime); // Cache deve ser igual ou mais rápido
    });

    // Test memory cleanup
    test('Should cleanup memory after large requests', async () => {
        const initialMemory = measureMemory();
        
        // Fazer uma requisição grande
        const largeTexts = Array(500).fill('test with long content for memory analysis');
        await request(app)
            .post('/filter')
            .send({
                text: largeTexts,
                lang: 'en'
            });

        // Esperar o GC atuar
        global.gc && global.gc();
        await new Promise(resolve => setTimeout(resolve, 1000));

        const finalMemory = measureMemory();
        const memoryDelta = finalMemory.heapUsed - initialMemory.heapUsed;
        
        expect(memoryDelta).toBeLessThan(50); // Menos de 50MB de diferença após GC
    }, 10000);
});
