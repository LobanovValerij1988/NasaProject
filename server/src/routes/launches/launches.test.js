const request = require("supertest");
const app = require('../../app');
const { loadPlanetsData } = require('../../models/planets.model')
const {
    connectToMongo,
    mongoDisconect
} = require('../../services/mongo')


describe('Launches API', ()=>{
    beforeAll(async()=>{
       await connectToMongo();
       await loadPlanetsData();
    })
    afterAll(async()=>{
        await mongoDisconect();
    })
    
    describe('Test GET /launches',()=>{
        test('It should respond with 200 success', async ()=>{   
            const response =await request(app).get('/v1/launches').expect(200);
        })
    })
    
    describe('Test Post /launch',()=>{
        const comleteLaunchData = {
            mission: "USS Enterprise",
            rocket: "NCC 1701-D",
            target: 'Kepler-62 f',
            launchDate: 'January 4, 2018'
        }
        const launchDataWithoutDate = {
            mission: "USS Enterprise",
            rocket: "NCC 1701-D",
            target: 'Kepler-62 f',
        }
        const launchDataWithWrondDate = {
            mission: "USS Enterprise",
            rocket: "NCC 1701-D",
            target: 'Kepler-62 f',
            launchDate: 'boo'
        }
    
        test('It should respond with 201 created',async ()=>{
            const respose = await request(app).post('/v1/launches')
                .send(comleteLaunchData).expect('Content-Type', /json/)
                .expect(201);
           
            const requestDate =new Date(comleteLaunchData.launchDate).valueOf();
            const responseDate = new Date(respose.body.launchDate).valueOf();
            expect(responseDate).toBe(requestDate);
            expect(respose.body).toMatchObject(launchDataWithoutDate)
        });
        test('It should catch missing required properties',async()=>{
            const respose = await request(app).post('/v1/launches')
                .send(launchDataWithoutDate).expect('Content-Type', /json/)
                .expect(400);
            expect(respose.body).toStrictEqual({
                error: 'Missing required json property'
            })
        });
        test('It should catch invalid dates',async()=>{
            const respose = await request(app).post('/v1/launches')
                .send(launchDataWithWrondDate).expect('Content-Type', /json/)
                .expect(400);
            expect(respose.body).toStrictEqual({
                error: 'Invalid launch date'
            })
        })
    })
    

})

