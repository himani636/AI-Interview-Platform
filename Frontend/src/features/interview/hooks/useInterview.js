import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
    setLoading(true)

    try {
        const response = await generateInterviewReport({
            jobDescription,
            selfDescription,
            resumeFile
        })

        const report = response?.interviewReport

        if (!report) return null

        setReport(report)

        return report
    } catch (error) {
        console.log(error)
        return null
    } finally {
        setLoading(false)
    }
}

    const getReportById = async (interviewId) => {
    setLoading(true)

    try {
        const response = await getInterviewReportById(interviewId)

        const report = response?.interviewReport

        if (!report) return null

        setReport(report)

        return report
    } catch (error) {
        console.log(error)
        return null
    } finally {
        setLoading(false)
    }
}
const getReports = async () => {
    setLoading(true)

    try {
        const response = await getAllInterviewReports()

        const reports = response?.interviewReports || []

        setReports(reports)

        return reports
    } catch (error) {
        console.log(error)
        setReports([])   // important fallback
        return []
    } finally {
        setLoading(false)
    }
}

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        try {
            const response = await generateResumePdf({ interviewReportId })
            const blob = response instanceof Blob ? response : new Blob([response], { type: "application/pdf" })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
            return true
        }
        catch (error) {
            console.log(error)
            return false
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [ interviewId ])

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf }

}