export const CATEGORY_META = {
  plant: {
    color: "red",
    label: "播种",
    icon: "/plant.png",
    description: "不紧急但重要",
    detail:
      "为了维持身心健康进行投资、健康管理、运动、家人、恋人、亲友、导师等自己来说十分重要的人或事",
    number: "1",
  },
  harvest: {
    color: "green",
    label: "收割",
    icon: "/harvest.png",
    description: "紧急且重要",
    detail:
      "和目前的生活、工作有直接关系的事情有特定截止日期的任务，如与导师的会议，演讲，论文提交",
    number: "2",
  },
  dry: {
    color: "gray",
    label: "风干",
    icon: "/dry.png",
    description: "不重要也不紧急",
    detail: "做不做意义不大的事，可以暂时停下思绪，比如杂事、打发时间的事情等",
    number: "4",
  },
  thin: {
    color: "blue",
    label: "疏苗",
    icon: "/thin.png",
    description: "紧急但不重要",
    detail:
      "不做也不会产生太大影响的事情，但基于目前的情况，需要尽快处理的事情，比如并不是很急的电话、邮件，以及其他一些抽空就可集中完成的事项等",
    number: "3",
  },
};

/**
 * Returns a CSS filter string to colorize black PNG icons based on category color
 * @param colorName The name of the color (red, green, blue, gray)
 * @returns CSS filter string
 */
export function getIconFilter(colorName: string): string {
  switch (colorName) {
    case "red":
      return "invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)";
    case "green":
      return "invert(48%) sepia(79%) saturate(200%) hue-rotate(100deg) brightness(90%) contrast(119%)";
    case "blue":
      return "invert(40%) sepia(80%) saturate(1500%) hue-rotate(200deg) brightness(100%) contrast(120%)";
    case "gray":
      return "invert(50%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)";
    default:
      return "none";
  }
}
