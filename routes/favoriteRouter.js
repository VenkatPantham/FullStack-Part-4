const express = require("express");
const bodyParser = require("body-parser");
var authenticate = require("../authenticate");
const cors = require("./cors");

const Dishes = require("../models/dishes");
const Favorites = require("../models/favorites");

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    if (req)
      Favorites.findOne({ user: req.user._id })
        .populate("user")
        .populate("dishes")
        .then(
          (favorite) => {
            if (favorite != null) {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            } else {
              res.json(null);
            }
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite != null) {
          req.body.forEach((dish) => {
            if (favorite.dishes.indexOf(dish._id) == -1) {
              favorite.dishes.push(dish._id);
            } else {
              console.log("Dish is already favorited, " + dish._id);
            }
          });
          favorite.save().then(
            (favorite) => {
              Favorites.find({ user: req.user._id })
                .populate("user")
                .populate("dishes")
                .then((favorite) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(favorite);
                });
            },
            (err) => next(err)
          );
        } else {
          Favorites.create({ user: req.user._id }).then((favorite) => {
            req.body.forEach((dish) => {
              if (favorite.dishes.indexOf(dish._id) == -1) {
                favorite.dishes.push(dish._id);
              } else {
                console.log("Dish is already favorited, " + dish._id);
              }
            });
            favorite.save().then(
              (favorite) => {
                Favorites.find({ user: req.user._id })
                  .populate("user")
                  .populate("dishes")
                  .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                  });
              },
              (err) => next(err)
            );
          });
        }

        (err) => next(err);
      })
      .catch((err) => {
        next(err);
      });
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.deleteOne({ user: req.user._id })
      .then(
        (resp) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(resp);
        },
        (err) => next(err)
      )
      .catch((err) => {
        next(err);
      });
  });

favoriteRouter
  .route("/:dishId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .post(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        if (dish != null) {
          Favorites.findOne({ user: req.user._id }).then((favorite) => {
            if (favorite != null) {
              if (favorite.dishes.indexOf(req.params.dishId) == -1) {
                favorite.dishes.push(req.params.dishId);
              } else {
                var err = new Error(
                  "Dish is already favorited, " + req.params.dishId
                );
                err.statusCode = 404;
                next(err);
              }
              favorite.save().then(
                (favorite) => {
                  Favorites.find({ user: req.user._id })
                    .populate("user")
                    .populate("dishes")
                    .then((favorite) => {
                      res.statusCode = 200;
                      res.setHeader("Content-Type", "application/json");
                      res.json(favorite);
                    });
                },
                (err) => next(err)
              );
            } else {
              Favorites.create({ user: req.user._id }).then((favorite) => {
                favorite.dishes.push(req.params.dishId);
                favorite.save().then(
                  (favorite) => {
                    Favorites.find({ user: req.user._id })
                      .populate("user")
                      .populate("dishes")
                      .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(favorite);
                      });
                  },
                  (err) => next(err)
                );
              });
            }
          });
        } else {
          var err = new Error("Dish not found, " + req.params.dishId);
          err.statusCode = 404;
          next(err);
        }
      })
      .catch((err) => {
        next(err);
      });
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        if (dish != null) {
          Favorites.findOne({ user: req.user._id }).then(
            (favorite) => {
              favorite.dishes = favorite.dishes.filter(
                (item) => item != req.params.dishId
              );
              favorite.save().then(
                (favorite) => {
                  Favorites.find({ user: req.user._id })
                    .populate("user")
                    .populate("dishes")
                    .then((favorite) => {
                      res.statusCode = 200;
                      res.setHeader("Content-Type", "application/json");
                      res.json(favorite);
                    });
                },
                (err) => next(err)
              );
            },
            (err) => next(err)
          );
        } else {
          var err = new Error("Dish not found, " + req.params.dishId);
          err.statusCode = 404;
          next(err);
        }
      })
      .catch((err) => {
        next(err);
      });
  });

module.exports = favoriteRouter;
