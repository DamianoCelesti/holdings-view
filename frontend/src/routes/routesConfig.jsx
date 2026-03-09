import NewPage from "../pages/NewPage";
import UncertainPage from "../pages/UncertainPage";
import SavedPage from "../pages/SavedPage";
import DismissedPage from "../pages/DismissedPage";

export const ROUTES = [
    {
        path: "/",
        label: "Nuovi",
        element: (props) => <NewPage {...props} />,
        end: true
    },
    {
        path: "/uncertain",
        label: "Incerti",
        element: (props) => <UncertainPage {...props} />
    },
    {
        path: "/saved",
        label: "Salvati",
        element: (props) => <SavedPage {...props} />
    },
    {
        path: "/dismissed",
        label: "Scartati",
        element: (props) => <DismissedPage {...props} />
    }
];