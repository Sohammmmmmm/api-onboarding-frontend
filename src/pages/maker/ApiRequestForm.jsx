import { ArrowLeft, Send, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { createOnboardingRequest } from "../../services/onboardingService";
import { getApiErrorMessage } from "../../services/api";
import { getEnvironments } from "../../services/masterService";

const fieldClass =
    "h-10 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:h-11";

const labelClass =
    "text-xs font-semibold text-slate-800 sm:text-sm";

const rowClass =
    "grid grid-cols-1 gap-1.5 sm:grid-cols-[155px_minmax(0,1fr)] sm:items-center sm:gap-4";

export default function ApiRequestForm() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        apiName: searchParams.get("apiName") || "",
        provider: searchParams.get("provider") || "",
        consumer: "",
        environment: "",
        businessJustification: "",
        additionalInformation: "",
    });

    const [environments, setEnvironments] = useState([]);

    const [loadingEnvironments, setLoadingEnvironments] =
        useState(true);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const [environmentError, setEnvironmentError] = useState("");

    const [success, setSuccess] = useState(null);

    /*
     * =========================================================
     * LOAD ENVIRONMENTS FROM MASTER CONFIGURATION
     * =========================================================
     */

    useEffect(() => {
        const loadEnvironments = async () => {
            setLoadingEnvironments(true);
            setEnvironmentError("");

            try {
                const response = await getEnvironments();

                /*
                 * Support common backend response formats:
                 *
                 * [
                 *   {
                 *      id: "DEV",
                 *      displayName: "Development"
                 *   }
                 * ]
                 *
                 * or:
                 *
                 * {
                 *    data: [...]
                 * }
                 *
                 * or:
                 *
                 * {
                 *    environments: [...]
                 * }
                 */

                const data =
                    Array.isArray(response)
                        ? response
                        : Array.isArray(response?.data)
                            ? response.data
                            : Array.isArray(response?.content)
                                ? response.content
                            : Array.isArray(response?.environments)
                                ? response.environments
                                : Array.isArray(response?.data?.environments)
                                    ? response.data.environments
                                    : [];

                const normalized = data
                    .map((environment) => {
                        if (typeof environment === "string") {
                            return {
                                id: environment,
                                displayName: environment,
                            };
                        }

                        return {
                            id:
                                environment?.id ||
                                environment?.code ||
                                environment?.value ||
                                environment?.name ||
                                "",
                            displayName:
                                environment?.displayName ||
                                environment?.label ||
                                environment?.name ||
                                environment?.code ||
                                environment?.id ||
                                "",
                        };
                    })
                    .filter((environment) => environment.id);

                setEnvironments(normalized);
                if (normalized.length === 0) {
                    setEnvironmentError("No environments are configured.");
                }

                /*
                 * If the form was opened with an existing environment,
                 * keep it if it exists in master configuration.
                 *
                 * Otherwise select the first active environment.
                 */
                setForm((previous) => {
                    const currentEnvironment = previous.environment;

                    const currentExists = normalized.some(
                        (environment) =>
                            environment.id === currentEnvironment
                    );

                    if (currentExists) {
                        return previous;
                    }

                    return {
                        ...previous,
                        environment:
                            normalized.length > 0
                                ? normalized[0].id
                                : "",
                    };
                });
            } catch (err) {
                console.error(
                    "ENVIRONMENT LOAD ERROR:",
                    err
                );

                setEnvironmentError(
                    err?.response?.data?.message ||
                    err?.response?.data?.error ||
                    "Unable to load environments. Please try again."
                );

                setEnvironments([]);
            } finally {
                setLoadingEnvironments(false);
            }
        };

        loadEnvironments();
    }, []);

    /*
     * =========================================================
     * HANDLE INPUT CHANGE
     * =========================================================
     */

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        /*
         * Clear error once user starts correcting the form.
         */
        if (error) {
            setError("");
        }
    };

    /*
     * =========================================================
     * VALIDATION
     * =========================================================
     */

    const validateForm = () => {
        if (!form.apiName.trim()) {
            return "API Name is required.";
        }

        if (!form.provider.trim()) {
            return "API Provider is required.";
        }

        if (!form.consumer.trim()) {
            return "Consumer Application is required.";
        }

        if (!form.environment.trim()) {
            return "Environment is required.";
        }

        if (!form.businessJustification.trim()) {
            return "Business Justification is required.";
        }

        return null;
    };

    /*
     * =========================================================
     * SUBMIT REQUEST
     * =========================================================
     */

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess(null);

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        if (loadingEnvironments) {
            setError(
                "Please wait until environments are loaded."
            );
            return;
        }

        setLoading(true);

        try {
            const payload = {
                apiName: form.apiName.trim(),

                provider: form.provider.trim(),

                consumer: form.consumer.trim(),

                environment: form.environment.trim(),

                businessJustification:
                    form.businessJustification.trim(),

                additionalInformation:
                    form.additionalInformation.trim(),
            };

            const response =
                await createOnboardingRequest(payload);

            setSuccess(response);

            /*
             * Backend can return requestId in different structures.
             */

            const requestId =
                response?.requestId ||
                response?.data?.requestId ||
                response?.id ||
                response?.data?.id;

            if (requestId) {
                setTimeout(() => {
                    navigate(`/requests/${requestId}`);
                }, 1000);
            }
        } catch (err) {
            console.error(
                "API REQUEST ERROR:",
                err
            );

            setError(getApiErrorMessage(err, "Unable to submit API request."));
        } finally {
            setLoading(false);
        }
    };

    /*
     * =========================================================
     * RENDER
     * =========================================================
     */

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
                                {environmentError && (
                                    <p className="text-xs text-red-600 sm:col-start-2">
                                        {environmentError}
                                    </p>
                                )}
                            </div>

                            {/* =================================================
                                CONSUMER APPLICATION
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
                                    disabled={loadingEnvironments || environments.length === 0}
                                    className={`${fieldClass} ${
                                        loadingEnvironments
                                            ? "cursor-not-allowed bg-slate-100"
                                            : ""
                                    }`}
                                >
                                    <option value="">
                                        {loadingEnvironments
                                            ? "Loading environments..."
                                            : "Select environment"}
                                    </option>

                                    {environments.map(
                                        (environment) => (
                                            <option
                                                key={environment.id}
                                                value={environment.id}
                                            >
                                                {
                                                    environment.displayName
                                                }
                                            </option>
                                        )
                                    )}
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
                                </label>

                                <textarea
                                    id="additionalInformation"
                                    name="additionalInformation"
                                    value={
                                        form.additionalInformation
                                    }
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Enter the API requirement / additional details..."
                                    className="w-full min-w-0 resize-none rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
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
                                disabled={
                                    loading ||
                                    loadingEnvironments ||
                                    environments.length === 0
                                }
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