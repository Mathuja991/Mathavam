
const mongoose = require('mongoose');

const patientRecordSchema = new mongoose.Schema({
    childNo: {
        type: String,
        required: [true, 'Child No is required'],
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Patient Name is required'],
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    contactNo: {
        type: String,
        trim: true
    },
    gnDiv: {
        type: String,
        trim: true
    },
    referredBy: {
        type: String,
        trim: true
    },
    reasonForReferral: {
        type: String,
        trim: true
    },
    dateOfInitialAssessment: {
        type: Date
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', null],
    },
    age: {
        type: Number
    },

    motherName: { type: String, trim: true },
    motherAge: { type: Number },
    motherQualification: { type: String, trim: true },
    motherOccupation: { type: String, trim: true },
    motherTelephoneNo: { type: String, trim: true },
    fatherName: { type: String, trim: true },
    fatherAge: { type: Number },
    fatherQualification: { type: String, trim: true },
    fatherOccupation: { type: String, trim: true },
    fatherTelephoneNo: { type: String, trim: true },
    diagnosis: { type: String, trim: true },

    familyHistoryOfDisorders: {
        devDisorders: { type: Boolean, default: false },
        asd: { type: Boolean, default: false },
        speechDisorders: { type: Boolean, default: false },
        psychiatricIllness: { type: Boolean, default: false },
        behavioralProblems: { type: Boolean, default: false },
        other: { type: String, trim: true }
    },

    birthHistory: {
        birthWeight: { type: Number },
        typeOfDelivery: { type: String, trim: true },
        mothersHealthDuringPregnancyDelivery: { type: String, trim: true },
        otherComplicationsDuringPregnancyDeliveryAfterDelivery: { type: String, trim: true }
    },

    reviewOfSystem: {
        visionProblem: { type: String, trim: true },
        hearingProblem: { type: String, trim: true },
        gastroIntestinalProblems: { type: String, trim: true },
        growthWeightProblems: {
            height: { type: Number },
            weight: { type: Number }
        },
        neurologicalProblems: { type: String, trim: true },
        anyOtherSpecifyReview: { type: String, trim: true }
    },

    developmentalHistory: {
        speech: { type: String, trim: true },
        motor: {
            grossMotor: { type: String, trim: true },
            fineMotor: { type: String, trim: true }
        }
    },

    schooling: { type: String, trim: true },

    autismDiagnosis: {
        diagnosedBefore: { type: Boolean, default: false },
        ifYesByWhomAndWhere: { type: String, trim: true },
        anyMedicationsGiven: { type: String, trim: true }
    },

    chiefComplaints: { type: String, trim: true },

    parentsExpectation: { type: String, trim: true },

    clinicalDiagnosis: {
        dsmIv: { type: String, trim: true },
        cars: { type: String, trim: true }
    },

    associatedConditions: { type: String, trim: true },

    managementPlan: { type: String, trim: true },

    homeTrainingRecommendations: { type: String, trim: true },

    summary: { type: String, trim: true },
    presentingComplaintsSummary: { type: String, trim: true },

    carsScore: { type: Number },
    vinelandSocialMaturityScale: { type: String, trim: true },

    assessmentPlan: {
        byConPsychiatrist: { type: Boolean, default: false },
        byConPediatrician: { type: Boolean, default: false },
        bySpeechTherapist: { type: Boolean, default: false },
        dateForHomeVisit: { type: Date },
        commencementOfTherapy: { type: Date }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PatientRecord', patientRecordSchema);