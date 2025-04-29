const COLOR_OPTIONS = ['#00AB55', '#1890FF', '#FF4842', '#04297A', '#7A0C2E'];

export const getRandomColorForLesson = () => {
  const randomIndex = Math.floor(Math.random() * COLOR_OPTIONS.length);
  return COLOR_OPTIONS[randomIndex];
};
