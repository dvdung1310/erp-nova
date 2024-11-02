import React from "react";
import Editor from "ckeditor5-custom-build";
import { CKEditor } from "@ckeditor/ckeditor5-react";

function TextEditor({ initData, setData }) {
  const editorConfiguration = {
    toolbar: {
      items: [
        "heading",
        "|",    
        "bold",
        "italic",
        "link",
        "bulletedList",
        "numberedList",
        "|",
        "outdent",
        "indent",
        "|",
        "imageUpload",
        "blockQuote",
        "insertTable",
        "mediaEmbed",
        "redo",
        "undo",
        "alignment",
        "code",
        "codeBlock",
        "fontfamily",
        "fontsize",
        "fontColor",
        "fontBackgroundColor",
        "imageInsert",
      ],
    },
    language: "vi",
    image: {
      toolbar: [
        "imageTextAlternative",
        "toggleImageCaption",
        "imageStyle:inline",
        "imageStyle:block",
        "imageStyle:side",
        "|",
        "resizeImage:original",
        "resizeImage:50",
        "resizeImage:75",
        "resizeImage:100",
      ],
      resizeOptions: [
        {
          name: "resizeImage:original",
          value: null,
          icon: "original",
          label: "Original",
        },
        {
          name: "resizeImage:50",
          value: "50",
          icon: "medium",
          label: "50%",
        },
        {
          name: "resizeImage:75",
          value: "75",
          icon: "large",
          label: "75%",
        },
        {
          name: "resizeImage:100",
          value: "100",
          icon: "large",
          label: "100%",
        },
      ],
      styles: ["alignLeft", "alignCenter", "alignRight"],
    },
    table: {
      contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
    },
  };

  return (
    <>
      <CKEditor
        editor={Editor}
        config={editorConfiguration}
        data={initData}
        onChange={(event, editor) => {
          const data = editor.getData();
          console.log(data);
          setData(data);
        }}
      />
    </>
  );
}

export default TextEditor;
