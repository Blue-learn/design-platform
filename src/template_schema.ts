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
            type: "component_type", // from WIDGET List
            position: "top-fixed", // optional
          },
        ],
      },
      dataStore: {
        layout_id: {},
        component1_id: {
          label: "Hello World", //props
          tapAction: {
            id: "component1_id", //triggered with component reference id
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
        }, //,
        nested_component_id: {},
      },
    },
  },
};
