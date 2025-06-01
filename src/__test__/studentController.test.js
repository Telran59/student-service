import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

const service = {
    addStudent: jest.fn(),
    findStudent: jest.fn(),
    updateStudent: jest.fn(),
    deleteStudent: jest.fn(),
    addScore: jest.fn(),
    findByName: jest.fn(),
    countByNames: jest.fn(),
    findByMinScore: jest.fn()
};

jest.unstable_mockModule('../services/studentService.js', () => service);

const {
    addStudent,
    findStudent,
    updateStudent,
    deleteStudent,
    addScore,
    findByName,
    countByNames,
    findByMinScore
} = await import('../controller/studentController.js');

const app = express();
app.use(express.json());
app.post('/student', addStudent);
app.get('/student/:id', findStudent);
app.delete('/student/:id', deleteStudent);
app.patch('/student/:id', updateStudent);
app.patch('/score/student/:id', addScore);
app.get('/students/name/:name', findByName);
app.get('/quantity/students', countByNames);
app.get('/students/exam/:exam/minscore/:minScore', findByMinScore);

describe('Student Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /student', () => {
        it('should return 201 if student is added', async () => {
            service.addStudent.mockResolvedValue(true);

            const response = await request(app)
                .post('/student')
                .send({ id: 1, name: 'John Doe', password: 'secret123' });

            expect(response.status).toBe(201);
            expect(service.addStudent).toHaveBeenCalledWith({ id: 1, name: 'John Doe', password: 'secret123' });
        });

        it('should return 400 if validation fails', async () => {
            const response = await request(app)
                .post('/student')
                .send({ name: '', age: 'abc' });

            expect(response.status).toBe(400);
            expect(service.addStudent).not.toHaveBeenCalled();
        });
    });

    describe('GET /student/:id', () => {
        it('should return student if found', async () => {
            service.findStudent.mockResolvedValue({ id: 1, name: 'John' });

            const response = await request(app).get('/student/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ id: 1, name: 'John' });
        });

        it('should return 404 if student not found', async () => {
            service.findStudent.mockResolvedValue(null);

            const response = await request(app).get('/student/999');

            expect(response.status).toBe(404);
        });
    });

    describe('PATCH /student/:id', () => {
        it('should update and return student', async () => {
            service.updateStudent.mockResolvedValue({ id: 1, name: 'Updated' });

            const response = await request(app)
                .patch('/student/1')
                .send({ name: 'Updated' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ id: 1, name: 'Updated' });
        });

        it('should return 400 if validation fails', async () => {
            const response = await request(app)
                .patch('/student/1')
                .send({ name: '' });

            expect(response.status).toBe(400);
        });

        it('should return 404 if student not found', async () => {
            service.updateStudent.mockResolvedValue(null);

            const response = await request(app)
                .patch('/student/999')
                .send({ name: 'Valid' });

            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /student/:id', () => {
        it('should delete student and return it', async () => {
            service.deleteStudent.mockResolvedValue({ id: 1 });

            const response = await request(app).delete('/student/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ id: 1 });
        });

        it('should return 404 if not found', async () => {
            service.deleteStudent.mockResolvedValue(null);

            const response = await request(app).delete('/student/999');

            expect(response.status).toBe(404);
        });
    });

    describe('PATCH /score/student/:id', () => {
        it('should return 204 if score added', async () => {
            service.addScore.mockResolvedValue(true);

            const response = await request(app)
                .patch('/score/student/1')
                .send({ examName: 'Math', score: 85 });

            expect(response.status).toBe(204);
        });

        it('should return 400 if validation fails', async () => {
            const response = await request(app)
                .patch('/score/student/1')
                .send({ examName: '', score: 'abc' });

            expect(response.status).toBe(400);
        });

        it('should return 409 if score not added', async () => {
            service.addScore.mockResolvedValue(false);

            const response = await request(app)
                .patch('/score/student/1')
                .send({ examName: 'Math', score: 85 });

            expect(response.status).toBe(409);
        });
    });

    describe('GET /students/name/:name', () => {
        it('should return students by name', async () => {
            service.findByName.mockResolvedValue([{ id: 1, name: 'Anna' }]);

            const response = await request(app).get('/students/name/Anna');

            expect(response.status).toBe(200);
            expect(response.body).toEqual([{ id: 1, name: 'Anna' }]);
        });
    });

    describe('GET /quantity/students', () => {
        it('should return count of students by names', async () => {
            service.countByNames.mockResolvedValue({ Anna: 2, John: 1 });

            const response = await request(app).get('/quantity/students?names=Anna&names=John');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ Anna: 2, John: 1 });
        });
    });

    describe('GET /students/exam/:exam/minscore/:minScore', () => {
        it('should return students with score >= minScore', async () => {
            service.findByMinScore.mockResolvedValue([{ id: 1, name: 'Test' }]);

            const response = await request(app).get('/students/exam/Math/minscore/80');

            expect(response.status).toBe(200);
            expect(response.body).toEqual([{ id: 1, name: 'Test' }]);
        });
    });
});
