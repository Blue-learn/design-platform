"use strict";
const templateSchema = {
    isError: false,
    success: {
        data: {
            layout: {
                type: "layouts/list",
                id: "layout_id",
                widgets: [
                    {
                        id: "component_id",
                        type: "component_type",
                        position: "top-fixed", // optional
                    },
                ],
            },
            dataStore: {
                layout_id: {},
                component1_id: {
                    label: "Hello World",
                    tapAction: {
                        id: "component1_id",
                        type: "api_call",
                        payload: {
                            url: "http://api.goole.com",
                            method: "post",
                            data: { foo: "bar" },
                        },
                    },
                },
                vstack: {
                    listWidgets: [{ type: "Button", id: "nested_component_id" }],
                },
                nested_component_id: {},
            },
        },
    },
};
//# sourceMappingURL=template_schema.js.map