import { TemplateSchema } from "./types";

export const template: TemplateSchema = {
  isError: false,
  success: {
    data: {
      layout: {
        type: "layouts/list",
        id: "layout_id",
        widgets: [
          {
            id: "button",
            type: "BUTTON", // from WIDGET List
            position: "top-fixed", // optional
          },
          {
            id: "space",
            type: "SPACE", // from WIDGET List
            position: "top-fixed", // optional
          },
          // {
          //   id: "avatar",
          //   type: "AVATAR", // from WIDGET List
          //   position: "top-fixed", // optional
          // },
        ],
      },
      datastore: {
        space: { size: "2" },
        button: {
          label: `Button`,
          type: "large-filled",
          width: "full",
          // iconName: "chat",
        },
        layout_id: {},
        avatar: {
          borderWidth: 0,
          size: "lg",
          uri: "https://reactnative.dev/img/tiny_logo.png",
        },
      },
    },
  },
};
