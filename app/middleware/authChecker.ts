import { ContextType, DI } from "..";
import { UserRoles } from "../interfaces";
import { AuthChecker } from "type-graphql";

export const authChecker: AuthChecker<ContextType, UserRoles> = async (
  { context },
  roles = []
) => {
  const myContext = context as ContextType;

  if (roles.includes(UserRoles.ADMIN)) {
    if (!myContext.req.userId) {
      return false;
    }
    const user = await DI.userRepo.findOne(myContext.req.userId);
    if (!user) {
      return false;
    }
    return user.isAdmin;
  }
  return typeof myContext.req.userId !== "undefined";
};
