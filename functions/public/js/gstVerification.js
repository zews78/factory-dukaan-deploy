const gstVerification = async (gstNo, key_secret) => {
  try {
    const res = await axios({
      method: "POST",
      url: "https://appyflow.in/api/verifyGST",
      data: {
        gstNo,
        key_secret,
      },
    });
    console.log(res);
  } catch (err) {
    console.log(err);
  }
};
