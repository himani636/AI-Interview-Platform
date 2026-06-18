const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const { generateInterviewReport, generateResumePdf } = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

async function extractResumeText(req) {
    const { selfDescription } = req.body

    if (req.file) {
        const mimetype = req.file.mimetype || ""

        if (mimetype === "application/pdf") {
            try {
                const pdfData = await pdfParse(req.file.buffer)
                if (!pdfData.text || pdfData.text.trim().length === 0) {
                    throw new Error("PDF appears to be empty or could not be parsed.")
                }
                return pdfData.text
            } catch (pdfError) {
                console.error("PDF parsing error:", pdfError.message);
                if (selfDescription && selfDescription.trim().length > 0) {
                    console.log("Falling back to self description due to PDF parsing error");
                    return selfDescription;
                }
                throw new Error(`Invalid or corrupted PDF file: ${pdfError.message}. Please provide a valid PDF or enter a self description.`);
            }
        }

        if (mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            try {
                const result = await mammoth.extractRawText({ buffer: req.file.buffer })
                if (!result.value || result.value.trim().length === 0) {
                    throw new Error("DOCX file appears to be empty or could not be parsed.")
                }
                return result.value
            } catch (docxError) {
                console.error("DOCX parsing error:", docxError.message);
                if (selfDescription && selfDescription.trim().length > 0) {
                    console.log("Falling back to self description due to DOCX parsing error");
                    return selfDescription;
                }
                throw new Error(`Invalid or corrupted DOCX file: ${docxError.message}. Please provide a valid DOCX or enter a self description.`);
            }
        }

        throw new Error("Unsupported resume file type. Please upload a PDF or DOCX file.")
    }

    if (selfDescription && selfDescription.trim().length > 0) {
        return selfDescription
    }

    throw new Error("Please provide a resume file or a self description.")
}

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    try {
        const resumetext = await extractResumeText(req)
        const { selfDescription, jobDescription } = req.body

        const interViewReportByAi = await generateInterviewReport({
            resume: resumetext,
            selfDescription,
            jobDescription
        })

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumetext,
            selfDescription,
            jobDescription,
            ...interViewReportByAi
        })

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })
    } catch (error) {
        console.error(error)
        res.status(400).json({
            message: error.message || "Failed to generate interview report."
        })
    }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}


/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findById(interviewReportId)

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
}

module.exports = { generateInterViewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController }