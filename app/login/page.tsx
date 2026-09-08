import TextField from "../register/TextField";


export default function Login() {
    return (
        <main className="w-full h-screen bg-pink-900 flex items-center justify-center">
            <div className="bg-white w-[90%] h-[80%] p-5 flex flex-col justify-between max-w-200 rounded-xl">
                <div className="flex flex-col gap-2">
                    <div className="w-full text-center text-2xl font-bold">
                        <span>Login</span>
                    </div>
                    <div className="flex flex-col gap-20 pt-10">
                        <TextField label="email" placeholder="enter your email"/>
                        <TextField label="password" placeholder="enter your password"/>
                    </div>
                </div>
                
                <div className="w-full flex justify-center ">
                    <button className="bg-pink-900 text-white w-[70%] max-w-100 py-5 rounded-xl">Login</button>
                </div>
            </div>            
        </main>
    )
}
