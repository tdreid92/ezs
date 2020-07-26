exports.handler = async (event: any) => {
  console.log(event);
  return {
    StatusCode: 204,
    Msg: 'No content found',
    Payload: {}
  };
};
