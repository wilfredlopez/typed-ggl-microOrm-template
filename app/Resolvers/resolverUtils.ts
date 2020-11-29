export function isInInfo(info: Record<any, any>, key: string) {
  try {
    if (info["operation"]) {
      const selSet = info["operation"]["selectionSet"];

      if (selSet) {
        const selections = selSet["selections"];
        if (Array.isArray(selections)) {
          for (let s of selections) {
            const customSelects = s.selectionSet?.selections;
            if (Array.isArray(customSelects)) {
              for (let names of customSelects) {
                if (names.name?.value === key) {
                  return true;
                }
              }
            }
          }
        }
      }
    }
    return false;
  } catch (error) {
    return false;
  }
}
