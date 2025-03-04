export default function Home() {
  return (
    <>
      <main className="container mx-auto mt-16 flex select-none flex-col px-80">
        {/* Make the card clickable while maintaining background interaction */}
        <div className="pointer-events-auto">
          <div className="flex flex-col items-start justify-center gap-3 ">
            <h1 className="text-3xl font-bold leading-tight text-amber-50">
              Mohamed Hachemi
            </h1>
            <p>Senior FrontEnd developer</p>
            <p className="mt-6">
              Senior frontend developer with 6+ years of expertise in building
              scalable web applications, optimizing performance, and leading
              cross-functional projects. proficient in react, next.js, and
              modern ui/ux practices, with a focus on design systems and agile
              workflows.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
