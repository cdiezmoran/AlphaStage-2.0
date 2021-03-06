import React, { Component } from 'react';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import { array, bool, func, object, string } from 'prop-types';

import gamesByTags from '../graphql/gamesByTags.graphql';

import { setCategory } from '../actions/category';

import Category from '../components/Category/Category';
import Loader from '../components/Loader';

const withGames = graphql(gamesByTags, {
  props: ({ data }) => {
    if (!data.gamesByTags) return { loading: data.loading };
    if (data.error) return { hasErrors: true };
    return {
      games: data.gamesByTags,
    };
  },
  options: (props) => ({ variables: { tags: [props.category] } })
});

const mapStateToProps = ({ category }) => (
  {
    category
  }
);

const mapDispatchToProps = dispatch => ({
  setCurrentCategory: category => dispatch(setCategory(category)),
});

class CategoryPage extends Component {
  componentWillMount() {
    const { match, setCurrentCategory } = this.props;
    setCurrentCategory(match.params.category);
  }

  render() {
    const { games, loading, category, setCurrentCategory } = this.props;

    return (
      loading
        ? <Loader />
        : <Category games={games} currentCategory={category} setCategory={setCurrentCategory} />
    );
  }
}

CategoryPage.propTypes = {
  loading: bool,
  games: array,
  category: string,
  match: object.isRequired,
  setCurrentCategory: func.isRequired
};

CategoryPage.defaultProps = {
  loading: false,
  games: [],
  category: ''
};

export default connect(mapStateToProps, mapDispatchToProps)(withGames(CategoryPage));
