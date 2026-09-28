import { ArrowLeft, Send, Settings, Paperclip } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOnboardingRequest } from "../../services/onboardingService";

const fieldClass =
    "h-10 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:h-11";

const labelClass =
    "text-xs font-semibold text-slate-800 sm:text-sm";

const rowClass =
    "grid grid-cols-1 gap-1.5 sm:grid-cols-[155px_minmax(0,1fr)] sm:items-center sm:gap-4";

export default function ApiRequestForm() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        apiName: "",
        provider: "",
        consumer: "",
        businessJustification: "",
        additionalInformation: "",
        environment: "UAT"
    });

    const [attachment, setAttachment] = useState(null);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState(null);


    /* =========================================================
       HANDLE INPUT CHANGE
    ========================================================= */

    const handleChange = (event) => {

        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };


    /* =========================================================
       HANDLE FILE
    ========================================================= */

    const handleFileChange = (event) => {

        const file = event.target.files?.[0];

        if (file) {
            setAttachment(file);
        }
    };


    /* =========================================================
       SUBMIT REQUEST
    ========================================================= */

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");

        setSuccess(null);

        /*
         * Backend currently requires:
         *
         * apiName
         * apiRequirement
         * businessJustification
         *
         * The UI uses "Additional Information".
         *
         * Therefore:
         *
         * additionalInformation -> apiRequirement
         */

        if (!form.apiName.trim()) {

            setError("API Name is required.");

            return;
        }

        if (!form.provider.trim()) {

            setError("API Provider is required.");

            return;
        }

        if (!form.consumer.trim()) {

            setError("Consumer Application is required.");

            return;
        }

        if (!form.businessJustification.trim()) {

            setError("Business Justification is required.");

            return;
        }

        /*
         * The backend requires apiRequirement.
         *
         * We use Additional Information as the
         * API requirement field for the existing UI.
         */
        if (!form.additionalInformation.trim()) {

            setError("Additional Information is required.");

            return;
        }


        setLoading(true);


        try {

            /*
             * IMPORTANT:
             *
             * Do NOT send the complete form object.
             *
             * Build the exact payload expected by
             * the Spring Boot backend.
             */

            const payload = {

                apiName: form.apiName.trim(),

                provider: form.provider.trim(),

                consumer: form.consumer.trim(),

                /*
                 * Backend field:
                 * apiRequirement
                 *
                 * UI field:
                 * additionalInformation
                 */
                apiRequirement:
                    form.additionalInformation.trim(),

                businessJustification:
                    form.businessJustification.trim(),

                environment:
                    form.environment

            };


            console.log(
                "ONBOARDING REQUEST PAYLOAD:",
                payload
            );


            const response =
                await createOnboardingRequest(payload);


            console.log(
                "ONBOARDING REQUEST RESPONSE:",
                response
            );


            setSuccess(response);


            /*
             * Backend returns requestId.
             *
             * Example:
             *
             * REQ-9c09e778-9b29-4e84-8cc9-9d8e661f70bf
             */

            const requestId =
                response?.requestId ||
                response?.data?.requestId ||
                response?.id ||
                response?.data?.id;


            /*
             * Navigate to request details after
             * successful submission.
             */

            if (requestId) {

                setTimeout(() => {

                    navigate(
                        `/requests/${requestId}`
                    );

                }, 1000);

            }

        } catch (err) {

            console.error(
                "API REQUEST ERROR:",
                err
            );


            /*
             * Try to show the backend validation message.
             */

            const backendMessage =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.response?.data?.details;


            if (backendMessage) {

                setError(
                    backendMessage
                );

            } else {

                setError(
                    "Unable to submit API request."
                );
            }

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="w-full min-w-0 bg-slate-50">

            <div className="mx-auto w-full max-w-4xl px-0 py-0 sm:px-1 lg:px-2">


                {/* =====================================================
                    PAGE HEADER
                ===================================================== */}

                <div className="mb-4 flex min-w-0 items-center gap-2 sm:mb-5 sm:gap-3">

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white hover:text-blue-600 sm:h-10 sm:w-10"
                    >

                        <ArrowLeft size={20} />

                    </button>


                    <div className="min-w-0">

                        <h1 className="truncate text-lg font-bold text-slate-800 sm:text-xl lg:text-2xl">
                            New API Request
                        </h1>

                        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                            Submit an API onboarding request.
                        </p>

                    </div>

                </div>


                {/* =====================================================
                    ERROR
                ===================================================== */}

                {error && (

                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-700 sm:px-4 sm:text-sm">

                        {error}

                    </div>

                )}


                {/* =====================================================
                    SUCCESS
                ===================================================== */}

                {success && (

                    <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-3 text-xs text-green-700 sm:px-4 sm:text-sm">

                        <div className="font-semibold">
                            Request submitted successfully.
                        </div>

                        {success?.requestId && (

                            <div className="mt-1">

                                Request ID:

                                <span className="ml-1 font-semibold">

                                    {success.requestId}

                                </span>

                            </div>

                        )}

                    </div>

                )}


                {/* =====================================================
                    MAIN CARD
                ===================================================== */}

                <div className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm sm:rounded-xl">


                    {/* =================================================
                        BLUE HEADER
                    ================================================= */}

                    <div className="flex items-center gap-2.5 bg-gradient-to-r from-blue-800 to-blue-700 px-4 py-3 sm:gap-3 sm:px-5 sm:py-4">

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 sm:h-9 sm:w-9">

                            <Settings
                                size={18}
                                className="text-white sm:h-5 sm:w-5"
                            />

                        </div>


                        <h2 className="text-sm font-bold tracking-wide text-white sm:text-base lg:text-lg">

                            API ACCESS REQUEST

                        </h2>

                    </div>


                    {/* =================================================
                        FORM
                    ================================================= */}

                    <form
                        onSubmit={handleSubmit}
                        className="p-4 sm:p-5 lg:p-6"
                    >

                        <div className="space-y-4 sm:space-y-5">


                            {/* =================================================
                                API NAME
                            ================================================= */}

                            <div className={rowClass}>

                                <label
                                    htmlFor="apiName"
                                    className={labelClass}
                                >

                                    API Name

                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>

                                </label>


                                <input
                                    id="apiName"
                                    name="apiName"
                                    value={form.apiName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter API name"
                                    className={fieldClass}
                                />

                            </div>


                            {/* =================================================
                                API PROVIDER
                            ================================================= */}

                            <div className={rowClass}>

                                <label
                                    htmlFor="provider"
                                    className={labelClass}
                                >

                                    API Provider

                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>

                                </label>


                                <select
                                    id="provider"
                                    name="provider"
                                    value={form.provider}
                                    onChange={handleChange}
                                    required
                                    className={fieldClass}
                                >

                                    <option value="">
                                        Select API provider
                                    </option>

                                    <option value="Core Banking">
                                        Core Banking
                                    </option>

                                    <option value="CRM">
                                        CRM
                                    </option>

                                    <option value="Payment Gateway">
                                        Payment Gateway
                                    </option>

                                    <option value="Customer Management">
                                        Customer Management
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>

                                </select>

                            </div>


                            {/* =================================================
                                CONSUMER
                            ================================================= */}

                            <div className={rowClass}>

                                <label
                                    htmlFor="consumer"
                                    className={labelClass}
                                >

                                    Consumer Application

                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>

                                </label>


                                <input
                                    id="consumer"
                                    name="consumer"
                                    value={form.consumer}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter consumer application"
                                    className={fieldClass}
                                />

                            </div>


                            {/* =================================================
                                ENVIRONMENT
                            ================================================= */}

                            <div className={rowClass}>

                                <label
                                    htmlFor="environment"
                                    className={labelClass}
                                >

                                    Environment

                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>

                                </label>


                                <select
                                    id="environment"
                                    name="environment"
                                    value={form.environment}
                                    onChange={handleChange}
                                    required
                                    className={fieldClass}
                                >

                                    <option value="DEV">
                                        Development
                                    </option>

                                    <option value="UAT">
                                        UAT
                                    </option>

                                    <option value="PROD">
                                        Production
                                    </option>

                                </select>

                            </div>


                            {/* =================================================
                                BUSINESS JUSTIFICATION
                            ================================================= */}

                            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[155px_minmax(0,1fr)] sm:items-start sm:gap-4">

                                <label
                                    htmlFor="businessJustification"
                                    className="pt-0.5 text-xs font-semibold text-slate-800 sm:pt-2 sm:text-sm"
                                >

                                    Business Justification

                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>

                                </label>


                                <textarea
                                    id="businessJustification"
                                    name="businessJustification"
                                    value={
                                        form.businessJustification
                                    }
                                    onChange={handleChange}
                                    required
                                    rows={3}
                                    placeholder="Explain why this API access is required..."
                                    className="w-full min-w-0 resize-none rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>


                            {/* =================================================
                                ADDITIONAL INFORMATION
                            ================================================= */}

                            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[155px_minmax(0,1fr)] sm:items-start sm:gap-4">

                                <label
                                    htmlFor="additionalInformation"
                                    className="pt-0.5 text-xs font-semibold text-slate-800 sm:pt-2 sm:text-sm"
                                >

                                    Additional Information

                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>

                                </label>


                                <textarea
                                    id="additionalInformation"
                                    name="additionalInformation"
                                    value={
                                        form.additionalInformation
                                    }
                                    onChange={handleChange}
                                    required
                                    rows={3}
                                    placeholder="Enter the API requirement / additional details..."
                                    className="w-full min-w-0 resize-none rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                            </div>


                            {/* =================================================
                                ATTACHMENT
                            ================================================= */}

                            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[155px_minmax(0,1fr)] sm:items-start sm:gap-4">

                                <label
                                    className="pt-0.5 text-xs font-semibold text-slate-800 sm:pt-2 sm:text-sm"
                                >

                                    Attachments

                                </label>


                                <div className="min-w-0">

                                    <label
                                        htmlFor="attachment"
                                        className="flex min-h-[68px] w-full cursor-pointer items-center gap-3 rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-3 transition hover:border-blue-400 hover:bg-blue-50 sm:px-4"
                                    >

                                        <Paperclip
                                            size={20}
                                            className="shrink-0 text-slate-500"
                                        />


                                        <div className="min-w-0">

                                            <div className="text-xs font-semibold text-blue-600 sm:text-sm">

                                                Choose File

                                            </div>


                                            <div className="mt-0.5 truncate text-[11px] text-slate-500 sm:text-xs">

                                                {attachment
                                                    ? attachment.name
                                                    : "No file chosen"}

                                            </div>

                                        </div>

                                    </label>


                                    <input
                                        id="attachment"
                                        type="file"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            DIVIDER
                        ================================================= */}

                        <div className="my-5 border-t border-slate-200 sm:my-6" />


                        {/* =================================================
                            SUBMIT
                        ================================================= */}

                        <div className="flex w-full justify-center">

                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[150px]"
                            >

                                <Send size={17} />

                                {loading
                                    ? "Submitting..."
                                    : "Submit Request"}

                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>
    );
}