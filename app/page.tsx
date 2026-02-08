import Image from "next/image";

export default function Home() {
  return (
    // two column layout with accordian on the left where we can input teacher name and subject and on the right side we preview the generated lesson plan
    <div className="flex h-screen">
      <div className="w-1/2 p-8 overflow-y-auto border-r">
        <h1 className="text-2xl font-bold mb-4">Lesson Plan Generator</h1>
        <div className="space-y-4">
          <details className="border rounded-lg p-4">
            <summary className="font-semibold cursor-pointer">Teacher Information</summary>
            <div className="mt-2">
              <label className="block mb-2">Teacher Name:</label>
              <input type="text" className="w-full border rounded p-2" placeholder="Enter teacher name" />
            </div>
          </details>
          <details className="border rounded-lg p-4">
            <summary className="font-semibold cursor-pointer">Subject Details</summary>
            <div className="mt-2">
              <label className="block mb-2">Subject:</label>
              <input type="text" className="w-full border rounded p-2" placeholder="Enter subject" />
            </div>
          </details>
          <details className="border rounded-lg p-4">
            <summary className="font-semibold cursor-pointer">Generate Lesson Plan</summary>
            <div className="mt-2">
              <button className="bg-blue-500 text-white px-4 py-2 rounded">Generate</button>
            </div>
          </details>
        </div>
      </div>
      <div className="w-1/2 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">Generated Lesson Plan Preview</h1>
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Teacher: [Teacher Name]</h2>
          {/* table for teachers with all of their information */}
          
          <h3 className="text-lg font-semibold mb-2">Subject: [Subject]</h3>
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Lesson Plan:</h4>
            <p>[Generated lesson plan will appear here]</p>
          </div>
        </div>
      </div>
    </div>
  );
}
