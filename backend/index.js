const express = require("express");
const app = express();
const Sequelize = require("sequelize");
app.use(express.json());

const POSTGRES_CONNECTION_STRING =
  "postgres://postgres:postgrespassword@localhost:5433/postgres";
const server = app.listen(8000, () => {
  console.log("server listening on port 8000");
});

app.post("/blog_post_event", async (req, res) => {
  let type;
  if (req.body.event.op === "INSERT") {
    type = "created";
  } else if (req.body.event.op === "UPDATE") {
    if (
      req.body.event.data.old.is_published === true &&
      req.body.event.data.new.is_published === false
    ) {
      type = "unpublished";
    } else if (
      req.body.event.data.old.is_published === false &&
      req.body.event.data.new.is_published === true
    ) {
      type = "published";
    }
  }

  if (type) {
    const blogPostId = req.body.event.data.new.id;
    const sequelize = new Sequelize(POSTGRES_CONNECTION_STRING, {});
    await sequelize.query(
      "INSERT INTO blog_post_activity(blog_post_id,type) values (:blogPostId, :type)",
      {
        replacements: {
          blogPostId,
          type,
        },
      }
    );
  }
  res.send(200);
});

app.post("/archive_posts", async (req, res) => {
  const sequelize = new Sequelize(POSTGRES_CONNECTION_STRING, {});
  const { age_in_second } = req.body.input;
  const query = `
  UPDATE blog_post
  SET is_published = false
  WHERE date < NOW() - INTERVAL '${age_in_second} second';
`;
  const [result, metadata] = await sequelize.query(query, {
    replacements: {
      age_in_second,
    },
  });
  res.status(200).json({
    count: metadata.rowCount,
  });
});
