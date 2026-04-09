import Image from "next/image";
import React from "react";

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <section className="bg-brand p-10 items-center justify-center hidden w-1/2 lg:flex xl:w-2/5">
        <div className="flex max-h-200 max-w-107.5 flex-col justify-center space-y-12">
          <Image
            src="/assets/logo-full.svg"
            alt="logo"
            width={224}
            height={82}
            className="h-auto invert"
          />
          <div className="space-y-5 text-white">
            <h1 className="h1">Jog down everything!</h1>
            <p className="body-1">
              This is a place to write down thoughts, emotions, tasks...
            </p>
          </div>
          <Image
            src="/assets/files.png"
            alt="combo"
            width={342}
            height={342}
            className="transition-all hover:rotate-2 hover:scale-105"
          />
        </div>
      </section>
      <section className="flex flex-col flex-1 items-center bg-white p-4 py-10 lg:justify-center lg:p-10 lg:py-0">
        <div className="mb-16 lg:hidden">
          <Image
            src="/assets/logo-full.svg"
            alt="logo"
            width={224}
            height={82}
            className="h-auto w-50 lg:w-62.5"
          />
        </div>

        {children}
      </section>
    </div>
  );
};

export default Layout;
