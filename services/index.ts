import { Invoke } from "./invoke";

const invoke = new Invoke();
invoke.connect();

(req, res) => {
    // serverless fn 
    // specify GET handling : exists, read
    // specify POST handling: create, update
    // specify default handling
}