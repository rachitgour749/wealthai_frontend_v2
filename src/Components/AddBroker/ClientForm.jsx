import React from 'react';
import { Input, Alert } from 'antd';

const ClientForm = ({ fields, formState, handleSubmit, loading, error }) => {
    // Separate fields into required and additional
    const requiredFields = fields.filter(field => field.isMandatory !== false);
    const additionalFields = fields.filter(field => field.isMandatory === false);

    const FieldBox = ({ title, fields: boxFields, isAdditional }) => (
        <div className={`flex-1 rounded-xl overflow-hidden border shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.05),0_10px_15px_-3px_rgba(0,0,0,0.1)] min-w-0 ${isAdditional ? 'bg-[#e1fbe9] border-[#5bcb7f]' : 'bg-[#defff3] border-[#9fddd2]'
            }`}>
            {/* Box Header */}
            <h3 className="text-[#0f3d39] flex justify-start items-center mt-[12px] pl-[10px] text-[18px] font-bold mb-[5px]">{title}</h3>

            {/* Box Content - Transparent */}
            <div className="p-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    {boxFields.map((field) => (
                        <div key={field.field} className="flex flex-col gap-1">
                            <div className="flex items-center gap-1 mb-1">
                                <label className="text-[12px] font-medium text-gray-600 uppercase ml-[4px]">
                                    {field.label}
                                </label>
                                {field.isMandatory !== false && (
                                    <span className="text-red-500 font-bold text-[12px]">*</span>
                                )}
                            </div>
                            <Input
                                key={`${field.field}-${formState[field.field]}`}
                                name={field.field}
                                type={field.value || 'text'}
                                placeholder={field.placeHolder}
                                defaultValue={formState[field.field] || ''}
                                required={field.isMandatory !== false}
                                disabled={loading}
                                className={`h-10 rounded-lg hover:border-wealth-500 focus:border-wealth-600 text-sm font-medium text-[#0f3d39] bg-white dark-placeholder ${isAdditional ? 'border-[#5bcb7f]' : 'border-[#9fddd2]'
                                    }`}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const onFormSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {};
        formData.forEach((value, key) => {
            if (value) data[key] = value.toString();
        });
        handleSubmit?.(data);
    };

    return (
        <form id="broker-add-form" onSubmit={onFormSubmit} className="p-4 h-full">
            {/* Custom styles for dark placeholder */}
            <style>{`
                .dark-placeholder::placeholder {
                    color: #0f3d39 !important; /* dark green */
                    opacity: 1 !important;
                    font-weight: 500;
                    font-size: 14px !important;
                }
                .dark-placeholder input::placeholder {
                    color: #0f3d39 !important;
                    opacity: 1 !important;
                    font-weight: 500;
                    font-size: 14px !important;
                }
                .ant-input::placeholder {
                    color: #0f3d39 !important;
                    opacity: 1 !important;
                    font-weight: 500;
                    font-size: 14px !important;
                }
            `}</style>

            {error && (
                <Alert
                    message={error}
                    type="error"
                    showIcon
                    className="rounded-lg mb-3 text-[13px]"
                />
            )}

            {/* Horizontal layout - Two columns side by side */}
            <div className="flex gap-4 h-full overflow-y-auto pr-2 custom-scrollbar">
                {requiredFields.length > 0 && (
                    <FieldBox title="Required Fields" fields={requiredFields} />
                )}

                {additionalFields.length > 0 && (
                    <FieldBox title="Additional Fields" fields={additionalFields} isAdditional={true} />
                )}
            </div>
            {/* Hidden submit button to allow Enter key to submit */}
            <button type="submit" className="hidden" />
        </form>
    );
};

export default ClientForm;
