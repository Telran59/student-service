import {jest} from '@jest/globals';

jest.unstable_mockModule('../repository/studentRepository.js', () => ({
    findStudentById: jest.fn(),
    createStudent: jest.fn(),
    deleteStudentById: jest.fn(),
    updateStudent: jest.fn(),
    updateStudentScore: jest.fn(),
    findStudentsByName: jest.fn(),
    countStudentsByNames: jest.fn(),
    findStudentsByMinScore: jest.fn()
}));

const repo = await import('../repository/studentRepository.js');
const service = await import('../services/studentService.js');

describe('studentService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('addStudent', () => {
        it('should create student if not exists', async () => {
            repo.findStudentById.mockResolvedValue(null);
            repo.createStudent.mockResolvedValue({});

            const result = await service.addStudent({ id: '1', name: 'Alice', password: 'secret' });

            expect(repo.findStudentById).toHaveBeenCalledWith('1');
            expect(repo.createStudent).toHaveBeenCalledWith({ _id: '1', name: 'Alice', password: 'secret' });
            expect(result).toBe(true);
        });

        it('should not create student if exists', async () => {
            repo.findStudentById.mockResolvedValue({ _id: '1' });

            const result = await service.addStudent({ id: '1', name: 'Alice', password: 'secret' });

            expect(repo.createStudent).not.toHaveBeenCalled();
            expect(result).toBe(false);
        });
    });

    describe('findStudent', () => {
        it('should return student without password', async () => {
            const student = { _id: '1', name: 'Alice', password: 'secret' };
            repo.findStudentById.mockResolvedValue({ ...student });

            const result = await service.findStudent('1');

            expect(result).toEqual({ _id: '1', name: 'Alice', password: undefined });
        });
    });

    describe('deleteStudent', () => {
        it('should return deleted student without password', async () => {
            repo.deleteStudentById.mockResolvedValue({ _id: '1', name: 'Bob', password: 'secret' });

            const result = await service.deleteStudent('1');

            expect(repo.deleteStudentById).toHaveBeenCalledWith('1');
            expect(result).toEqual({ _id: '1', name: 'Bob', password: undefined });
        });
    });

    describe('updateStudent', () => {
        it('should return updated student without scores', async () => {
            repo.updateStudent.mockResolvedValue({ _id: '1', name: 'Carol', scores: [100] });

            const result = await service.updateStudent('1', { name: 'Carol' });

            expect(repo.updateStudent).toHaveBeenCalledWith('1', { name: 'Carol' });
            expect(result).toEqual({ _id: '1', name: 'Carol', scores: undefined });
        });
    });

    describe('addScore', () => {
        it('should update student score', async () => {
            const scoreUpdate = { _id: '1', scores: { math: 95 } };
            repo.updateStudentScore.mockResolvedValue(scoreUpdate);

            const result = await service.addScore('1', 'math', 95);

            expect(repo.updateStudentScore).toHaveBeenCalledWith('1', 'math', 95);
            expect(result).toEqual(scoreUpdate);
        });
    });

    describe('findByName', () => {
        it('should return students without passwords', async () => {
            const students = [
                { _id: '1', name: 'Alice', password: 'secret' },
                { _id: '2', name: 'Alice', password: 'hidden' },
            ];
            repo.findStudentsByName.mockResolvedValue(students);

            const result = await service.findByName('Alice');

            expect(result).toEqual([
                { _id: '1', name: 'Alice', password: undefined },
                { _id: '2', name: 'Alice', password: undefined },
            ]);
        });
    });

    describe('countByNames', () => {
        it('should return count by names', async () => {
            const names = ['Alice', 'Bob'];
            repo.countStudentsByNames.mockResolvedValue(2);

            const result = await service.countByNames(names);

            expect(repo.countStudentsByNames).toHaveBeenCalledWith(names);
            expect(result).toBe(2);
        });
    });

    describe('findByMinScore', () => {
        it('should return students with min score and without passwords', async () => {
            const students = [
                { _id: '1', name: 'Dan', password: 'x' },
                { _id: '2', name: 'Eve', password: 'y' },
            ];
            repo.findStudentsByMinScore.mockResolvedValue(students);

            const result = await service.findByMinScore('math', 80);

            expect(repo.findStudentsByMinScore).toHaveBeenCalledWith('math', 80);
            expect(result).toEqual([
                { _id: '1', name: 'Dan', password: undefined },
                { _id: '2', name: 'Eve', password: undefined },
            ]);
        });
    });
});
