
const express = require('express');
const router = express.Router();
const PatientRecord = require('../models/PatientRecord');

const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRoleMiddleware');

const ROLES_VIEW_ALL = ['Super Admin', 'Admin', 'Doctor', 'Therapist', 'Resource Person', 'Parent'];
const ROLES_CRUD_SUPER_ADMIN = ['Super Admin'];

router.get(
    '/', 
    authMiddleware,
    checkRole(ROLES_VIEW_ALL),
    async (req, res) => {
    try {
        const records = await PatientRecord.find({});
        res.status(200).json(records);
    } catch (err) {
        console.error('Error fetching all patient records:', err);
        res.status(500).json({ message: 'Server error fetching records', error: err.message });
    }
});

router.get('/child/:childNo', async (req, res) => {
    try {
        const rawChildNo = (req.params.childNo || "").trim();
        if (!rawChildNo) {
            return res.status(400).json({ message: 'Child number is required' });
        }

        const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const matchRegex = new RegExp(`^${escapeRegex(rawChildNo)}$`, "i");

        const query = {
            $or: [
                { childNo: rawChildNo },
                { childNo: matchRegex },
                { childno: rawChildNo },
                { childno: matchRegex },
            ],
        };

        const record = await PatientRecord.findOne(query)
            .collation({ locale: "en", strength: 2 })
            .setOptions({ strictQuery: false });

        if (!record) {
            return res.status(404).json({ message: 'Patient record not found' });
        }

        res.status(200).json(record);
    } catch (err) {
        console.error(`Error fetching patient record with childNo ${req.params.childNo}:`, err);
        res.status(500).json({ message: 'Server error fetching record', error: err.message });
    }
});

router.get(
    '/:id', 
    authMiddleware,
    checkRole(ROLES_VIEW_ALL),
    async (req, res) => {
    try {
        const record = await PatientRecord.findById(req.params.id);
        if (!record) {
            return res.status(404).json({ message: 'Patient record not found' });
        }
        res.status(200).json(record);
    } catch (err) {
        console.error(`Error fetching patient record with ID ${req.params.id}:`, err);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid record ID format' });
        }
        res.status(500).json({ message: 'Server error fetching record', error: err.message });
    }
});

router.post(
    '/', 
    authMiddleware,
    checkRole(ROLES_CRUD_SUPER_ADMIN),
    async (req, res) => {
    try {
        const newRecord = new PatientRecord(req.body);
        const savedRecord = await newRecord.save();
        res.status(201).json(savedRecord);
    } catch (err) {
        console.error('Error creating new patient record:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message, errors: err.errors });
        }
        res.status(500).json({ message: 'Server error creating record', error: err.message });
    }
});

router.put(
    '/:id', 
    authMiddleware,
    checkRole(ROLES_CRUD_SUPER_ADMIN),
    async (req, res) => {
    try {
        const updatedRecord = await PatientRecord.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedRecord) {
            return res.status(404).json({ message: 'Patient record not found' });
        }
        res.status(200).json(updatedRecord);
    } catch (err) {
        console.error(`Error updating patient record with ID ${req.params.id}:`, err);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid record ID format' });
        }
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message, errors: err.errors });
        }
        res.status(500).json({ message: 'Server error updating record', error: err.message });
    }
});

router.delete(
    '/:id', 
    authMiddleware,
    checkRole(ROLES_CRUD_SUPER_ADMIN),
    async (req, res) => {
    try {
        const deletedRecord = await PatientRecord.findByIdAndDelete(req.params.id);

        if (!deletedRecord) {
            return res.status(404).json({ message: 'Patient record not found' });
        }
        res.status(200).json({ message: 'Patient record deleted successfully' });
    } catch (err) {
        console.error(`Error deleting patient record with ID ${req.params.id}:`, err);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid record ID format' });
        }
        res.status(500).json({ message: 'Server error deleting record', error: err.message });
    }
});

module.exports = router;
