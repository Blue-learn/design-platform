declare const templateSchema: {
    isError: boolean;
    success: {
        data: {
            layout: {
                type: string;
                id: string;
                widgets: {
                    id: string;
                    type: string;
                    position: string;
                }[];
            };
            dataStore: {
                layout_id: {};
                component1_id: {
                    label: string;
                    tapAction: {
                        id: string;
                        type: string;
                        payload: {
                            url: string;
                            method: string;
                            data: {
                                foo: string;
                            };
                        };
                    };
                };
                vstack: {
                    listWidgets: {
                        type: string;
                        id: string;
                    }[];
                };
                nested_component_id: {};
            };
        };
    };
};
