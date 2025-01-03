export const COLORS = {
  fg: "#e30002",
  bg: "#fcfeff",
  bgOverlay: "rgba(241, 250, 255, 0.7)",
  alt: "#ffef9b",
  grayDark: "#5d7280",
  grayMed: "#d0dfe7",
  grayLight: "#e1ecf2",
  grayUltraLight: "#f1faff",
};

export const CONFIG = {
  pageInlinePadding: 50,
  pageBlockPadding: 50,
  contentLeftOffset: 32,

  lang: "de-DE" as keyof typeof LABELS,
  currency: "EUR",
  hourlyRate: 50,
};

export const CONTENT = {
  companyName: "Vogelino SpA",
  firstName: "Lucas",
  fatherLastName: "Vogel",
  motherLastName: "Urzúa",
  companyAddressStreetName: "Alfredo Barros Errázuriz",
  companyAddressStreetNumber: "1954",
  companyAddressOfficeNumber: "1211",
  companyAddressNeighbourhood: "Providencia",
  companyAddressCity: "Santiago",
  companyAddressCountry: "Chile",
  companyTaxNumber: "77.881.368-8",
  companyEmailAddress: "contact@vogelino.com",
  companyPhoneNumber: "+56 9 8706 1539",
  companyWebsiteUrl: "https://vogelino.com",

  clientName: "David Pomerenke\nSoftwaredienstleistungen",
  clientAddressLine1: "Römerstr. 60",
  clientAddressLine2: "70180 Stuttgart",
  clientAddressLine3: "Deutschland",
  clientTaxNumber: "DE365633057",
  clientNumber: "0070",
  invoiceNumber: 5,
  invoiceDate: new Date(),
  invoiceLocation: "Santiago",

  bankName: "Banco Santander Chile",
  bankAccountNumber: "5104616960",
  bankAddress: "Bandera 140, Santiago Chile",
  bankSwift: "BSCHCLRM",
};

export const LABELS = {
  "en-US": {
    hourlyRateNoticeLabel: "Underlying hourly rate for price calculation",
    taxId: "Tax ID",
    clientNr: "Client Nr.",
    invoiceNr: "Invoice Nr.",
    tableHeaderDescription: "Description",
    tableHeaderHours: "Hours",
    tableHeaderPrice: "Price",
    tableTotal: "Total",
    reverseChargeNotice:
      "Tax liability of the service recipient (reverse charge).",
    notice: "Notice",
    originalInvoiceLanguageSpanish:
      "The original invoice in Spanish, issued by the Chilean Tax Authority (SII), is attached",
  },
  "es-CL": {
    hourlyRateNoticeLabel: "Tasa horaria subyacente para la cálculo de precios",
    taxId: "RUT",
    clientNr: "n.º cliente",
    invoiceNr: "n.º factura",
    tableHeaderDescription: "Descripción",
    tableHeaderHours: "Horas",
    tableHeaderPrice: "Precio",
    tableTotal: "Total",
    reverseChargeNotice:
      "Responsabilidad tributaria del destinatario del servicio (reversión de cargo).",
    notice: "Aviso",
    originalInvoiceLanguageSpanish: "",
  },
  "fr-CH": {
    hourlyRateNoticeLabel: "Taux horaire sous-jacent pour le calcul des prix",
    taxId: "TVA",
    clientNr: "n° client",
    invoiceNr: "n° de facture",
    tableHeaderDescription: "Description",
    tableHeaderHours: "Heures",
    tableHeaderPrice: "Prix",
    tableTotal: "Total",
    reverseChargeNotice:
      "Responsabilité fiscale du destinataire du service (remboursement de charges).",
    notice: "Avis",
    originalInvoiceLanguageSpanish:
      "La facture originale en espagnol, émise par l'autorité fiscale chilienne (SII), est jointe",
  },
  "de-DE": {
    hourlyRateNoticeLabel: "Unterlagere Stundensatz für die Preisberechnung",
    taxId: "Steuernummer",
    clientNr: "Kundennummer",
    invoiceNr: "Rechnungsnummer",
    tableHeaderDescription: "Beschreibung",
    tableHeaderHours: "Stunden",
    tableHeaderPrice: "Preis",
    tableTotal: "Gesamt",
    reverseChargeNotice: "Steueranspruch des Dienstempfangers (Gutschrift).",
    notice: "Hinweis",
    originalInvoiceLanguageSpanish:
      "Die ursprüngliche Rechnung in Spanisch, ausgestellt von der chilenischen Steuerbehörde (SII), ist angehängt",
  },
};

export const SVGS = {
  companyLogoString: `<svg xmlns="http://www.w3.org/2000/svg" width="108" height="16" viewBox="0 0 88 13" fill="none"><path fill="${COLORS.fg}" d="M41.099 0c2.788 0 4.863 1.467 5.238 3.542C46.732 1.344 47.811.03 49.525.03c1.96 0 3.105 1.77 3.105 4.36 0 .721-.111 1.454-.321 2.155l-.05.155.088-.014c.053-.007.105-.013.158-.017l.16-.01.12-.003c.976 0 1.763.432 2.195 1.157l-.001-.065.002-.43C55.027 2.3 55.908.09 58.109.03l.1-.001h.07c1.939.05 2.854 1.752 3.086 5.51.508-3.274 2.247-5.51 4.774-5.51 1.333 0 2.469.627 3.288 1.752l.03.042.005-.013c.395-1.034 1.17-1.69 2.202-1.773l.107-.006.104-.002c1.846 0 3.039 1.81 3.322 4.58.791-2.692 3.25-4.58 6.23-4.58 3.636 0 6.499 2.813 6.499 6.47 0 3.663-2.87 6.5-6.5 6.5-3.139 0-5.71-2.124-6.347-5.07-.559 2.945-2.35 4.951-4.597 4.951-1.359 0-2.506-.71-3.3-1.948l-.092-.149-.014.04c-.43 1.194-1.23 1.956-2.3 2.048l-.105.007-.103.002c-1.762 0-2.864-1.331-3.225-3.53-.275 2.37-1.246 3.53-3.14 3.53-1.62 0-2.57-.864-2.981-2.598l-.032-.138-.036.105c-.555 1.49-2.263 2.631-4.207 2.631-2.398 0-3.808-1.186-4.42-3.633-.282 2.217-2.45 3.633-5.458 3.633-2.942 0-5.209-1.358-5.827-3.329-.778 1.932-2.802 3.33-5.207 3.33-3.197 0-5.503-1.87-6.134-4.666l-.034.127C23.089 11.073 20.613 13 17.622 13c-3.277 0-5.937-2.315-6.42-5.463-.867 2.995-2.939 5.344-5.31 5.344C2.65 12.881 0 8.823 0 4.51 0 1.73 1.175.03 3.342.03 4.37.03 5.262.502 5.844 1.3l.046.067.068-.093A3.045 3.045 0 0 1 8.203.039l.126-.007.112-.002c1.917 0 3.036 1.507 3.178 3.937C12.59 1.622 14.887.03 17.622.03c3.082 0 5.61 2.02 6.307 4.864C24.64 1.965 27.177 0 30.672 0c2.159 0 3.817 1.19 3.817 2.83a2.16 2.16 0 0 1-.677 1.585l-.105.094.053.03a3.597 3.597 0 0 1 1.718 2.316c.16-.269.37-.505.618-.696l.06-.045-.018-.016c-.499-.432-.794-1.036-.848-1.767l-.007-.123-.002-.115C35.282 1.723 37.742 0 41.1 0ZM17.622.958c-2.979 0-5.572 2.259-5.572 5.542s2.593 5.571 5.572 5.571c2.98 0 5.573-2.288 5.573-5.571S20.6.958 17.622.958Zm63.805 0c-2.98 0-5.573 2.259-5.573 5.542s2.594 5.571 5.573 5.571C84.406 12.071 87 9.783 87 6.5S84.406.958 81.427.958ZM41.099.928c-3.335 0-4.891 1.71-4.891 3.165 0 1.218.89 1.828 2.297 1.828.474 0 .949-.06 1.2-.164l-.148.877c-.37-.12-.874-.179-1.363-.179-1.379 0-2.194.684-2.194 1.991 0 1.59 1.586 3.507 5.07 3.507 2.741 0 4.564-1.278 4.564-3.21 0-1.277-1.038-2.005-2.09-2.005-1.29 0-2 1.084-2 1.872 0 .341.177.936.548 1.263l-.786.416c.06-1.352-.948-2.244-2.593-1.323l-.238-.861c1.171.089 2.046-.164 2.653-.565a1.799 1.799 0 0 0 .83-1.515c0-.506-.222-1.01-.681-1.382-.638-.505-1.601-.877-2.787-1.04l.43-.788.189.105.192.105c1.54.825 3.08 1.344 3.532.013l.652.624a1.422 1.422 0 0 0-1.126 1.397c0 .683.474 1.144 1.185 1.144 1.2 0 1.927-.788 1.927-1.976 0-1.486-1.32-3.298-4.372-3.298Zm8.426.03c-1.72 0-2.401 2.11-2.431 4.502l-.001.32c.013 3.607.76 6.173 3.854 6.173 2.164 0 3.468-1.56 3.468-2.734 0-1.13-.755-1.634-1.63-1.634-1.022 0-2.09.713-2.43 1.99l-.771-.445c1.274-.98 2.12-2.883 2.12-4.74 0-1.857-.682-3.432-2.18-3.432Zm8.73 0h-.105c-1.35.036-2.245 1.422-2.245 6.79l.002.277c.034 2.37.526 3.928 2.295 3.928 1.77 0 2.261-1.557 2.296-3.928l.002-.277-.002-.41c-.045-5.03-.929-6.345-2.243-6.38Zm13.62 0c-.978 0-1.779.832-1.779 2.6 0 1.768.8 3.195 2.668 4.353l-.563.699c-.608-1.323-2.253-2.214-1.734.624l-.875-.164c.252-.624.297-1.367.297-2.154 0-3.58-1.497-5.958-3.75-5.958-2.816 0-4.002 3.58-4.002 6.656l.001.131c.025 2.263.714 4.208 2.43 4.208 1.17 0 1.942-1.367 1.942-3.432 0-1.991-.564-4.413-2.031-5.334l.741-.49.079.18c.692 1.52 1.647 1.946 1.833.444l.608.668c-.504.223-.83 1.07-.83 2.11 0 3.506 1.467 5.854 3.572 5.854 1.645 0 3.853-1.828 3.853-6.018 0-2.986-.978-4.977-2.46-4.977ZM8.44.958c-1.305 0-2.283 1.07-2.283 2.66 0 2.095.978 3.7 2.268 4.011l-.519.728-.106-.132-.108-.131-.112-.127c-.889-.994-1.812-1.37-1.245 2.054h-.89l.043-.27.039-.266c.41-3.047-.618-2.385-1.505-1.31l-.147.182-.519-.728c1.29-.312 2.268-1.916 2.268-4.011 0-1.59-.979-2.66-2.283-2.66C1.638.958.926 2.414.926 4.51c0 3.165 1.927 7.444 4.965 7.444 2.89 0 4.817-4.28 4.817-7.444 0-2.095-.711-3.55-2.267-3.55Zm22.231-.03c-4.135 0-6.017 2.883-6.017 5.69 0 2.705 1.72 5.335 5.38 5.335 2.905 0 4.624-2.214 4.624-4.16 0-1.546-1.097-2.942-3.38-2.942-1.466 0-2.593 1.01-2.593 2.303 0 .564.43 1.144 1.275 1.144.756 0 1.823-.49 2.104-1.456l.727.535c-.727.208-1.586 1.277-.238 1.946l-.652.624c.06-1.174-3.127-1.872-3.483.208l-.696-.565c1.126-.208.934-3.105-1.32-2.51l.208-.877c1.112 1.084 3.735-1.382 1.75-2.868l.74-.505c.09 1.1.756 1.486 2.327 1.486 1.438 0 2.134-.713 2.134-1.486 0-.906-.993-1.901-2.89-1.901Zm52.74 2.16.683.58c-.77.568-1.342 1.272-1.39 1.787l-.004.07c0 .728.756 1.352 1.764 1.56l-.43.787-.102-.103c-.606-.599-1.123-.923-1.543-.923-.427 0-.581.305-.66.843-.07.49-.031 1.179.11 2.028l.032.176h-.89c.156-.865.21-1.578.154-2.095l-.013-.109c-.079-.538-.232-.843-.66-.843-.422 0-.938.325-1.55.93l-.094.096-.43-.787.107-.025c.918-.22 1.604-.789 1.653-1.458l.003-.078c0-.498-.538-1.198-1.29-1.778l-.103-.079.681-.579.089.172c.267.51.555.95.842 1.287l.096.108c.335.365.66.587.96.587.3 0 .624-.222.96-.587.32-.348.641-.828.938-1.395l.087-.172Zm-65.345-.273-.03.175c-.143.85-.182 1.538-.11 2.028.078.539.23.843.659.843l.07-.003c.408-.034.9-.353 1.473-.92l.102-.102.43.787-.107.024c-.954.229-1.657.834-1.657 1.536l.003.07c.046.492.57 1.156 1.286 1.71l.104.078-.682.579-.088-.172c-.296-.567-.619-1.048-.938-1.395-.335-.365-.66-.587-.96-.587-.299 0-.624.222-.96.587l-.095.108a7.013 7.013 0 0 0-.843 1.286l-.088.173-.682-.58.104-.078c.751-.58 1.29-1.28 1.29-1.779l-.003-.077c-.052-.695-.79-1.282-1.761-1.483l.43-.788.094.096c.612.605 1.128.93 1.55.93.428 0 .582-.304.66-.843.077-.525.026-1.276-.14-2.203h.89Z" /></svg>`,
  clientLogoString: `<svg xmlns="http://www.w3.org/2000/svg" width="117" height="24" viewBox="0 0 159 32" fill="none"><path fill="#2F2FA2" d="M49.918 18.245c-1.024 1.773-2.333 2.65-4.913 2.65-3.073 0-5.198-2.135-5.198-5.873 0-3.737 2.03-5.816 5.54-5.816 2.39 0 3.85 1.087 4.666 2.899l-2.77 1.354c-.303-1.05-.778-1.716-1.973-1.716-1.574 0-2.542 1.258-2.542 3.355 0 2.06.873 3.261 2.618 3.261.892 0 1.689-.515 2.087-1.544l2.485 1.43Z"/><path fill="#2F2FA2" fill-rule="evenodd" d="M54.533 9.323c0-1.065-.73-1.579-1.705-1.579-.899 0-1.648.514-1.648 1.579 0 1.026.75 1.558 1.648 1.558.975 0 1.705-.532 1.705-1.558Zm-.318 11.426h-2.773v-8.784h2.773v8.784Z" clip-rule="evenodd"/><path fill="#2F2FA2" d="M62.697 20.303c-.796.402-1.743.593-2.88.593-1.782 0-2.995-.822-2.995-2.961v-3.916h-1.27v-2.178h1.29V9.97l2.804-.324v2.196h2.597v2.178h-2.616v3.266c0 .917.36 1.204 1.043 1.204.55 0 1.042-.21 1.553-.573l.474 2.387ZM67.246 15.597c.475 1.727.57 2.878.57 2.878h.076s.095-1.17.61-2.879l1.142-3.761h2.968l-3.559 9.673c-1.027 2.782-2.264 3.185-4.168 3.185a7.846 7.846 0 0 1-1.655-.21l.438-2.534c.323.211.742.326 1.16.326.762 0 1.257-.288 1.561-1.074l-3.254-9.366h3.083l1.028 3.761ZM76.91 9.498v8.768h4.161v2.483h-6.999V9.5h2.838Z"/><path fill="#2F2FA2" fill-rule="evenodd" d="M85.504 18.647h4.143l.745 2.101h3.074L89.36 9.498h-3.494l-4.066 11.25h2.997l.706-2.101Zm3.304-2.388h-2.501l.305-.879c.63-1.834.917-3.266.917-3.266h.076s.229 1.413.897 3.286l.306.859ZM103.963 17.692c0-1.337-.802-2.426-2.481-2.675v-.076c1.221-.325 2.004-1.222 2.004-2.617 0-1.757-1.203-2.827-3.474-2.827h-4.944v11.251h4.906c2.748 0 3.989-1.222 3.989-3.056Zm-4.6-3.572c.782 0 1.279-.286 1.279-1.07 0-.84-.478-1.127-1.337-1.127h-1.374v2.197h1.432Zm-1.432 4.203h1.794c.84 0 1.336-.23 1.336-1.09 0-.706-.496-1.05-1.336-1.05h-1.794v2.14ZM119.188 17.367c0-1.088-.587-2.12-2.216-2.368l.02-.077c1.4-.19 2.574-1.204 2.574-2.903 0-1.471-.909-2.522-3.199-2.522h-4.62l-1.95 11.251h4.866c2.726 0 4.525-1.089 4.525-3.381Zm-4.013-3.247c.776 0 1.458-.286 1.458-1.223 0-.707-.398-.974-1.136-.974h-1.288l-.379 2.197h1.345Zm-2.084 4.203h1.78c.889 0 1.514-.345 1.514-1.223 0-.573-.303-.917-1.135-.917h-1.78l-.379 2.14ZM128.915 18.277l-2.703-.645c-.191.834-.628 1.1-1.275 1.1-.933 0-1.409-.816-1.18-1.974h5.196c.247-.494.38-1.176.38-1.88 0-1.65-1.18-3.188-3.73-3.188-2.551 0-4.873 1.917-4.873 5.39 0 2.335 1.447 3.816 3.978 3.816 2.475 0 3.693-.835 4.207-2.62Zm-2.475-3.398c0 .152-.019.285-.038.399h-2.341c.21-.817.666-1.519 1.428-1.519.742 0 .951.493.951 1.12Z" clip-rule="evenodd"/><path fill="#2F2FA2" d="M137.124 15.12c-1.257-.67-2.972-.478-3.295 1.378l-.743 4.25h-2.877l1.543-8.845h2.515l-.057 2.432c.609-1.819 2.076-2.968 3.581-2.565l-.667 3.35ZM141.017 17.8c-.077.42-.038.782.538.782.173 0 .346-.037.577-.095l-.461 2.159a5.267 5.267 0 0 1-1.519.249c-1.75 0-2.442-.88-2.153-2.58l1.845-10.279h2.903l-1.73 9.763Z"/><path fill="#2F2FA2" fill-rule="evenodd" d="M148.288 9.182c0-1.069-.736-1.584-1.717-1.584-.906 0-1.66.515-1.66 1.584 0 1.03.754 1.565 1.66 1.565.981 0 1.717-.535 1.717-1.565Zm-1.112 9.257c-.566 0-.604-.363-.529-.783l1.001-5.821h-2.85l-1.113 6.336c-.283 1.7.396 2.577 2.114 2.577.471 0 1.018-.095 1.49-.248l.453-2.157c-.226.058-.396.096-.566.096Z" clip-rule="evenodd"/><path fill="#2F2FA2" d="M157.822 17.678c-.076.417-.038.777.537.777.172 0 .345-.037.574-.094l-.459 2.141a5.27 5.27 0 0 1-1.514.247c-1.743 0-2.432-.872-2.145-2.559l.479-2.73c.134-.795-.019-1.44-.9-1.44-.69 0-1.265.607-1.514 1.99l-.824 4.644h-2.892l1.552-8.756h2.528l.038 1.781c.556-1.288 1.341-1.99 2.816-1.99 1.399 0 2.28.891 2.28 2.237 0 .303-.019.511-.058.739l-.498 3.014Z"/><path fill="#F64C72" d="m17.348 22.502-5.246-2.992.1-13.377L22.911 0l5.083 2.91-.02 13.461-10.627 6.131Z"/><path fill="#393A61" d="m12.685 4.5-1.69.979-.044 5.949-6 3.473-.08 10.816L0 22.907.099 9.505 10.716 3.36l1.97 1.14Z"/><path fill="#2F2FA2" d="m11.021 12.858-.055 7.438 6.41 3.687 4.495-2.616-.007 4.502L11.326 32l-5.203-2.993.1-13.377 4.798-2.772Z"/></svg>`,
  envelopeIconString: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.33334 2.33325H11.6667C12.3083 2.33325 12.8333 2.85825 12.8333 3.49992V10.4999C12.8333 11.1416 12.3083 11.6666 11.6667 11.6666H2.33334C1.69167 11.6666 1.16667 11.1416 1.16667 10.4999V3.49992C1.16667 2.85825 1.69167 2.33325 2.33334 2.33325Z" stroke="${COLORS.grayDark}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M12.8333 3.5L7 7.58333L1.16667 3.5" stroke="${COLORS.grayDark}" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  phoneIconString: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none"><g clip-path="url(#a)"><path stroke="${COLORS.grayDark}" fill="none" stroke-linecap="round" stroke-linejoin="round" d="M8.78 2.917a2.916 2.916 0 0 1 2.303 2.304M8.78.583a5.25 5.25 0 0 1 4.638 4.632m-.584 4.655v1.75a1.165 1.165 0 0 1-1.271 1.167 11.545 11.545 0 0 1-5.034-1.791 11.376 11.376 0 0 1-3.5-3.5 11.544 11.544 0 0 1-1.791-5.058 1.167 1.167 0 0 1 1.16-1.271h1.75A1.167 1.167 0 0 1 5.314 2.17c.074.56.211 1.11.409 1.64a1.167 1.167 0 0 1-.263 1.23l-.74.74a9.333 9.333 0 0 0 3.5 3.5l.74-.74a1.167 1.167 0 0 1 1.23-.263c.53.198 1.08.335 1.64.409a1.166 1.166 0 0 1 1.003 1.184Z"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h14v14H0z"/></clipPath></defs></svg>`,
  webglobeIconString: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none"><g stroke="${COLORS.grayDark}" fill="none" stroke-linecap="round" stroke-linejoin="round" clip-path="url(#a)"><path d="M7 12.833A5.833 5.833 0 1 0 7 1.167a5.833 5.833 0 0 0 0 11.666ZM1.167 7h11.666"/><path d="M7 1.167A8.925 8.925 0 0 1 9.333 7 8.925 8.925 0 0 1 7 12.833 8.925 8.925 0 0 1 4.667 7 8.925 8.925 0 0 1 7 1.167Z"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h14v14H0z"/></clipPath></defs></svg>`,
};
