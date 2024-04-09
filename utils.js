export const sayHello = () => {
  console.log("Hlelo");
};

export const loadStatus = {
  INITIAL: "initial",
  LOADED: "loaded",
  EMPTY: "empty",
};

export const defaultValues = {
  sitesInfo: {
    prod: { urlArr: [], time: 0 },
    nonProd: { urlArr: [], time: 0 },
  },
  sitesData: {
    domain: [],
    webPage: [],
  },
  currentWebsite: {
    id: null,
    url: null,
    status: loadStatus.EMPTY,
    startTime: null,
    lastAccessedDate: null,
  },
};
