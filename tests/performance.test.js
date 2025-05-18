const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const app = require('../src/app');

app.use(bodyParser.json());

describe('API Performance Tests', () => {
    // Test response time for single text
    test('Single text processing should respond within 100ms', async () => {
        const startTime = Date.now();
        const res = await request(app)
            .post('/filter')
            .send({
                text: 'this is a test text with some bad words like bullshit and damn',
                lang: 'en-us'
            });
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        expect(res.status).toBe(200);
        expect(responseTime).toBeLessThan(100); // Should respond in less than 100ms
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
                lang: 'en-us'
            });
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        expect(res.status).toBe(200);
        expect(responseTime).toBeLessThan(1000); // Should process in less than 1 second
        expect(res.body.results).toHaveLength(100);
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
                    lang: 'en-us'
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
                lang: 'en-us'
            });

        expect(res.status).toBe(200);
        expect(res.body.results).toHaveLength(1000);
    });

    // Test with long text
    test('Should process very long text efficiently', async () => {
        const longText = 'this is bullshit '.repeat(1000); // Creates a very long text

        const startTime = Date.now();
        const res = await request(app)
            .post('/filter')
            .send({
                text: longText,
                lang: 'en-us'
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
                lang: 'en-us'
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
                        lang: 'en-us'
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

    // Test multiple languages concurrently
    test('Should handle concurrent requests in different languages', async () => {
        const languages = ['en-us', 'pt-br', 'es-es', 'fr-fr', 'de-de'];
        const requests = languages.flatMap(lang =>
            Array.from({ length: 10 }, () =>
                request(app)
                    .post('/filter')
                    .send({
                        text: 'test text',
                        lang,
                        extras: ['test1', 'test2']
                    })
            )
        );

        const startTime = Date.now();
        const results = await Promise.all(requests);
        const endTime = Date.now();
        const totalTime = endTime - startTime;

        expect(totalTime).toBeLessThan(2000); // All languages should process within 2 seconds
        results.forEach(res => expect(res.status).toBe(200));
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
                        lang: 'en-us'
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

    // Test memory cleanup
    test('Should properly clean up memory after large requests', async () => {
        const initialMemory = process.memoryUsage().heapUsed;
        
        // Make several large requests
        for (let i = 0; i < 5; i++) {
            const largeText = Array.from({ length: 1000 }, () => 'test text with bad words').join(' ');
            const res = await request(app)
                .post('/filter')
                .send({
                    text: largeText,
                    lang: 'en-us'
                });
            
            expect(res.status).toBe(200);
        }

        // Force garbage collection if possible
        if (global.gc) {
            global.gc();
        }

        const finalMemory = process.memoryUsage().heapUsed;
        const memoryIncrease = finalMemory - initialMemory;
        
        // Memory increase should be reasonable (less than 50MB)
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
});
