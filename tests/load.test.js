const request = require('supertest');
const app = require('../src/app');

describe('API Load Tests', () => {
    // Simulates a burst of concurrent requests
    test('Should handle burst of 100 concurrent requests with mixed payload sizes', async () => {
        const startTime = Date.now();
        
        // Create different payloads
        const smallPayload = { text: 'small test with badword', lang: 'en' };
        const mediumPayload = { 
            text: Array(50).fill('medium test with badword'),
            lang: 'en'
        };
        const largePayload = {
            text: Array(200).fill('large test with multiple badwords and more content'),
            lang: 'en',
            extras: ['extraword1', 'extraword2'],
            safe_words: ['safe1', 'safe2'],
            include_stats: true
        };

        // Mix of requests
        const requests = [
            ...Array(50).fill(smallPayload),
            ...Array(30).fill(mediumPayload),
            ...Array(20).fill(largePayload)
        ].map(payload => 
            request(app)
                .post('/filter')
                .send(payload)
        );

        const results = await Promise.all(requests);
        const endTime = Date.now();
        const totalTime = endTime - startTime;

        // Check if the total time is within acceptable limits
        // (assuming the server can handle this burst in under 5 seconds)
        // Note: Adjust the time limit based on your server's expected performance
        // and the complexity of the payloads
        expect(totalTime).toBeLessThan(5000); // 5 seconds
        results.forEach(res => {
            expect(res.status).toBe(200);
        });
    }, 10000); // Timeout increased to 10 seconds

    // Load test with sustained requests
    test('Should maintain performance under sustained load', async () => {
        const rounds = 5; // 5 rounds of requests
        const requestsPerRound = 20; // Each round will have 20 requests
        const results = [];

        for (let round = 0; round < rounds; round++) {
            const roundStart = Date.now();
            
            // 20 requests in parallel
            const requests = Array(requestsPerRound).fill().map(() =>
                request(app)
                    .post('/filter')
                    .send({
                        text: 'sustained load test with badword',
                        lang: 'en',
                        include_stats: true
                    })
            );

            const roundResults = await Promise.all(requests);
            const roundEnd = Date.now();
            
            results.push({
                round,
                time: roundEnd - roundStart,
                success: roundResults.every(res => res.status === 200)
            });

            // Wait for a short period before the next round
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Check if all rounds were successful
        expect(results.every(r => r.success)).toBe(true);
        
        // Average time across all rounds
        const avgTimes = results.map(r => r.time);
        const maxVariation = Math.max(...avgTimes) - Math.min(...avgTimes);
        expect(maxVariation).toBeLessThan(1000); // Max variation should be less than 1 second
    }, 30000); // Timeout raised to 30 seconds

    // Test for recovery after overload
    test('Should recover after overload', async () => {
        // Primeira fase: sobrecarga
        const overloadPayload = {
            text: Array(500).fill('overload test with badword'),
            lang: 'en'
        };

        // Sending overload requests
        const overloadStart = Date.now();
        await request(app)
            .post('/filter')
            .send(overloadPayload);
        const overloadTime = Date.now() - overloadStart;

        // Checking recovery
        const normalPayload = {
            text: 'normal request after overload',
            lang: 'en'
        };

        // 5 normal requests after overload
        const recoveryResults = [];
        for (let i = 0; i < 5; i++) {
            const start = Date.now();
            const res = await request(app)
                .post('/filter')
                .send(normalPayload);
            recoveryResults.push({
                time: Date.now() - start,
                status: res.status
            });
        }

        // Checking if every request was successful and within time limits
        recoveryResults.forEach(result => {
            expect(result.status).toBe(200);
            expect(result.time).toBeLessThan(100); // Cada requisição deve levar menos de 100ms
        });
    }, 15000); // Timeout raised to 15 seconds

    // Cache test under load
    test('Should utilize cache effectively under load', async () => {
        const repeatedPayload = {
            text: 'cached content test with badword',
            lang: 'en'
        };

        // First request (no cache)
        const firstStart = Date.now();
        await request(app)
            .post('/filter')
            .send(repeatedPayload);
        const firstTime = Date.now() - firstStart;

        // 50 simultaneous requests with the same payload
        const cachedStart = Date.now();
        const requests = Array(50).fill().map(() =>
            request(app)
                .post('/filter')
                .send(repeatedPayload)
        );

        const results = await Promise.all(requests);
        const totalCachedTime = Date.now() - cachedStart;
        const avgCachedTime = totalCachedTime / 50;

        // Checking
        expect(avgCachedTime).toBeLessThan(firstTime); // Average cached time should be less than the first request time
        results.forEach(res => {
            expect(res.status).toBe(200);
            expect(res.body.results.filtered_text).toBeDefined();
        });
    }, 10000); // Timeout raised to 10 seconds
});
