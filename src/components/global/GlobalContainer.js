import { useContext } from "react";
import { LoadingContext } from "../../providers/LoadingProvider";
import GlobalLoading from "./global_Loading";
import { WarningContext } from "../../providers/WarningProvider";
import GlobalWarning from "./global_Warning";
import GlobalMobileChecker from "./global_MobileChecker";
import { MessageContext } from "../../providers/MessageProvider";
import InfoHover from "../InfoHover";

export default function GlobalsContainer() {
  const { loading, setLoading } = useContext(LoadingContext);
  const { warning, setWarning } = useContext(WarningContext);
  const { message, setMessage } = useContext(MessageContext);

  return (
    <>
      <GlobalMobileChecker />

      {loading.loading ? (
        <GlobalLoading
          error={loading.error}
          complete={loading.complete}
          customMessage={loading.message}
          onComplete={loading.onComplete}
        />
      ) : null}

      {warning ? (
        <GlobalWarning
          headerMessage={warning.headerMessage}
          message={warning.message}
          singleConfirm={warning.singleConfirm}
          confirmDanger={warning.confirmDanger}
          cancelAction={warning.cancelAction}
          confirmAction={warning.confirmAction}
        />
      ) : null}

      {message ? <InfoHover message={message} /> : null}
    </>
  );
}
