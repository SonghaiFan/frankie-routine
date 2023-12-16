import Header from "@/components/Header";
import GridCard from "@/components/GridCard";
import ToDoList from "@/components/ToDoList";

export default function Home() {
  return (
    <div className="flex flex-col h-screen w-screen">
      <Header />
      <div className="flex flex-grow flex-wrap gap-5 md:flex-nowrap p-8 overflow-auto">
        {/* Grid Section */}
        <div className="grid grid-cols-2 gap-4 w-full md:w-1/2 px-4">
          <GridCard
            categories="播种"
            description="不紧急但重要"
            detail="为了维持身心健康进行投资、健康管理、运动、家人、恋人、亲友、导师等自己来说十分重要的人或事"
            number="1"
          />
          <GridCard
            categories="收割"
            description="紧急且重要"
            detail="和目前的生活、工作有直接关系的事情有特定截止日期的任务，如与导师的会议，演讲，论文提交"
            number="2"
          />
          <GridCard
            categories="疏苗"
            description="紧急但不重要"
            detail="不做也不会产生太大影响的事情，但基于目前的情况，需要尽快处理的事情，比如并不是很急的电话、邮件，以及其他一些抽空就可集中完成的事项等"
            number="3"
          />
          <GridCard
            categories="风干"
            description="不重要也不紧急"
            detail="做不做意义不大的事，可以暂时停下思绪，比如杂事、打发时间的事情等"
            number="4"
          />
        </div>

        {/* To-Do List Section */}
        <div className="container mx-auto max-h-full">
          <ToDoList />
        </div>
      </div>
    </div>
  );
}
