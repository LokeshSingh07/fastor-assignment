import { Router } from "express";
const userRouter = Router();



import { login, signup } from "../controller/user.controller.js";



userRouter.post("/register", signup);
userRouter.post("/login", login);




export default userRouter;